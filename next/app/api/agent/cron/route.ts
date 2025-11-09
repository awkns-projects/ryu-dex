import { NextRequest } from 'next/server';
import {
  getAgentRecordsByModelId,
  getFullAgentWithModelsAndActions,
  getAllActiveSchedules,
  updateAgentSchedule
} from '@/lib/db/agent-queries';
import {
  executeActionOnRecord as runActionOnRecord
} from '@/lib/agent-execution';
import { evaluateQuery, type ScheduleQuery } from '@/lib/filter-evaluation';

// GET endpoint for testing/status check
export async function GET(request: NextRequest) {
  try {
    const maxSchedulesPerRun = parseInt(process.env.CRON_MAX_SCHEDULES_PER_RUN || '100');
    const url = new URL(request.url);
    const agentIdFilter = url.searchParams.get('agentId') || undefined;

    let activeSchedules = await getAllActiveSchedules(maxSchedulesPerRun);
    if (agentIdFilter) {
      activeSchedules = activeSchedules.filter(s => s.agentId === agentIdFilter);
    }
    const currentTime = new Date();

    const scheduleStatus = activeSchedules.map(schedule => {
      let status = 'not due';
      let nextRun = null;

      // All schedules are recurring now (filtered at DB level)
      {
        const intervalHours = schedule.intervalHours || 24;
        const intervalMs = intervalHours * 60 * 60 * 1000;

        if (!schedule.lastRunAt) {
          status = 'due now (never run)';
        } else {
          const lastRunTime = new Date(schedule.lastRunAt);
          const timeSinceLastRun = currentTime.getTime() - lastRunTime.getTime();

          if (timeSinceLastRun >= intervalMs) {
            status = 'due now';
          } else {
            const nextRunTime = new Date(lastRunTime.getTime() + intervalMs);
            status = 'scheduled';
            nextRun = nextRunTime.toISOString();
          }
        }
      }

      return {
        id: schedule.id,
        name: schedule.name,
        mode: schedule.mode,
        intervalHours: schedule.intervalHours,
        status: schedule.status,
        lastRunAt: schedule.lastRunAt,
        nextRunAt: nextRun,
        executionStatus: status,
        stepCount: schedule.steps?.length || 0
      };
    });

    return Response.json({
      currentTime: currentTime.toISOString(),
      totalRecurringSchedules: activeSchedules.length,
      maxSchedulesPerRun,
      schedulesDue: scheduleStatus.filter(s => s.executionStatus.includes('due')).length,
      schedules: scheduleStatus,
      note: "Only showing active recurring schedules (run-once schedules are manual only)"
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const maxSchedulesPerRun = parseInt(process.env.CRON_MAX_SCHEDULES_PER_RUN || '100');
    console.log('🕐 CRON: Starting schedule execution check...');

    // Check for cron authorization header or token
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_SECRET_TOKEN || 'cron-secret-token';

    if (!authHeader || !authHeader.includes(cronToken)) {
      console.log('⚠️ CRON: Unauthorized access attempt');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse optional agent filter from body
    let agentIdFilter: string | undefined;
    try {
      const body = await request.json().catch(() => null);
      if (body && typeof body === 'object' && body.agentId) {
        agentIdFilter = String(body.agentId);
      }
    } catch { }

    // Get all active recurring schedules (filtered at DB level, limited by env var)
    let activeSchedules = await getAllActiveSchedules(maxSchedulesPerRun);
    if (agentIdFilter) {
      activeSchedules = activeSchedules.filter(s => s.agentId === agentIdFilter);
    }
    console.log(`📊 Found ${activeSchedules.length} active recurring schedules (max ${maxSchedulesPerRun})`);

    const currentTime = new Date();
    const schedulesToRun = [];

    // Check which schedules need to run (all are recurring now)
    for (const schedule of activeSchedules) {
      console.log(`🔍 Checking recurring schedule: ${schedule.name}`);

      {
        // For recurring schedules, check if enough time has passed since last run
        const intervalHours = schedule.intervalHours || 24;
        const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds

        let shouldRun = false;

        if (!schedule.lastRunAt) {
          // Never run before - should run now
          shouldRun = true;
          console.log(`🆕 Recurring schedule ${schedule.name} has never run - scheduling now`);
        } else {
          const lastRunTime = new Date(schedule.lastRunAt);
          const timeSinceLastRun = currentTime.getTime() - lastRunTime.getTime();

          if (timeSinceLastRun >= intervalMs) {
            shouldRun = true;
            console.log(`⏰ Recurring schedule ${schedule.name} is due (${Math.round(timeSinceLastRun / 1000 / 60 / 60)}h since last run, interval: ${intervalHours}h)`);
          } else {
            const hoursUntilNext = Math.round((intervalMs - timeSinceLastRun) / 1000 / 60 / 60);
            console.log(`⏳ Schedule ${schedule.name} not due yet (${hoursUntilNext}h remaining)`);
          }
        }

        if (shouldRun) {
          schedulesToRun.push(schedule);
        }
      }
    }

    console.log(`🚀 Executing ${schedulesToRun.length} schedules`);

    // Execute each schedule that needs to run
    const executionResults = [];

    for (const schedule of schedulesToRun) {
      try {
        console.log(`🔄 Executing schedule: ${schedule.name}`);
        const result = await executeSchedule(schedule);
        executionResults.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          success: true,
          result
        });

        // Update lastRunAt and nextRunAt timestamps
        const intervalHours = schedule.intervalHours || 24;
        const nextRunAt = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000);
        await updateAgentSchedule(schedule.id, {
          lastRunAt: currentTime.toISOString(),
          nextRunAt: nextRunAt.toISOString(),
          // For one-time schedules, set status to paused after execution
          ...(schedule.mode === 'once' ? { status: 'paused' as const } : {})
        });

        console.log(`✅ Schedule ${schedule.name} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing schedule ${schedule.name}:`, error);
        executionResults.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${activeSchedules.length} schedules, executed ${schedulesToRun.length}`,
      totalSchedules: activeSchedules.length,
      executedSchedules: schedulesToRun.length,
      results: executionResults
    });

  } catch (error) {
    console.error('❌ CRON execution error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Execute a single schedule by running all its steps
async function executeSchedule(schedule: any) {
  console.log(`📋 Executing schedule steps for: ${schedule.name}`);

  // Get the full agent data to access models and actions
  const agent = await getFullAgentWithModelsAndActions(schedule.agentId);
  if (!agent) {
    throw new Error(`Agent not found for schedule ${schedule.name}`);
  }

  const stepResults = [];

  // Execute each schedule step in order
  const sortedSteps = [...schedule.steps].sort((a, b) => a.order - b.order);

  for (const step of sortedSteps) {
    try {
      console.log(
        `🔄 Executing schedule step ${step.order}: Query ${step.modelName || step.modelId} → Run ${step.actionName || step.actionId}`
      );
      console.log(`🔧 DEBUG Step data:`, JSON.stringify(step, null, 2));

      // Find the target model
      const targetModel = step.modelName
        ? agent.models.find(m => m.name === step.modelName)
        : agent.models.find(m => m.id === step.modelId);
      if (!targetModel) {
        throw new Error(`Model ${step.modelName || step.modelId} not found`);
      }

      // Find the action
      const action = step.actionName
        ? agent.actions.find(a => a.name === step.actionName)
        : agent.actions.find(a => a.id === step.actionId);
      if (!action) {
        throw new Error(`Action ${step.actionName || step.actionId} not found`);
      }

      // Get all records for the model
      const allRecords = await getAgentRecordsByModelId(targetModel.id);
      console.log(`📊 Found ${allRecords.length} records in ${step.modelName || targetModel.name} model`);

      // Filter records using query
      let recordsToProcess = allRecords;

      // NEW: Structured query object (preferred)
      if (step.query && typeof step.query === 'object' && step.query.filters) {
        const query = step.query as ScheduleQuery;
        recordsToProcess = allRecords.filter(record => evaluateQuery(record.data, query));
        console.log(`🔍 Query with ${query.filters.length} filters (${query.logic}) matched ${recordsToProcess.length} records`);
      }
      // OLD: String query (backward compatibility)
      else if (step.query && typeof step.query === 'string' && step.query.trim()) {
        const queryLower = step.query.toLowerCase();
        recordsToProcess = allRecords.filter(record => {
          const recordData = JSON.stringify(record.data).toLowerCase();
          return recordData.includes(queryLower) ||
            queryLower.split(' ').some((keyword: string) => recordData.includes(keyword));
        });
        console.log(`🔍 Query "${step.query}" filtered to ${recordsToProcess.length} records`);
      }

      // Execute the action on each matching record
      const recordResults = [];
      for (const record of recordsToProcess) {
        try {
          console.log(`⚡ Executing action ${step.actionName} on record ${record.id}`);

          // Execute the action steps on this record
          const actionResult = await runActionOnRecord(action, record, agent, undefined, schedule.id);
          recordResults.push({
            recordId: record.id,
            success: true,
            result: actionResult
          });

        } catch (error) {
          console.error(`❌ Error executing action on record ${record.id}:`, error);
          recordResults.push({
            recordId: record.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      stepResults.push({
        stepOrder: step.order,
        modelName: step.modelName,
        actionName: step.actionName,
        query: step.query,
        totalRecords: allRecords.length,
        processedRecords: recordsToProcess.length,
        recordResults
      });

      console.log(`✅ Schedule step ${step.order} completed: ${recordResults.filter(r => r.success).length}/${recordResults.length} records processed successfully`);

    } catch (error) {
      console.error(`❌ Error in schedule step ${step.order}:`, error);
      stepResults.push({
        stepOrder: step.order,
        modelName: step.modelName,
        actionName: step.actionName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    scheduleId: schedule.id,
    scheduleName: schedule.name,
    stepsExecuted: stepResults.length,
    stepResults
  };
}
