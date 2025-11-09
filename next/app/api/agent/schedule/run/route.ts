import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getScheduleById, updateScheduleLastRun } from '@/lib/db/queries';
import {
  getFullAgentWithModelsAndActions,
  getAgentRecordsByModelId,
  createAgentExecution,
  updateAgentExecution
} from '@/lib/db/agent-queries';
import { executeActionOnRecord } from '@/lib/agent-execution';
import { evaluateQuery, type ScheduleQuery } from '@/lib/filter-evaluation';

export async function POST(request: NextRequest) {
  try {
    // Get session using Better Auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Missing scheduleId' }, { status: 400 });
    }

    // Get schedule with steps
    const schedule = await getScheduleById(scheduleId);

    // Get the full agent data to access models and actions
    const agent = await getFullAgentWithModelsAndActions(schedule.agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sortedSteps = [...schedule.steps].sort((a, b) => a.order - b.order);

          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            totalSteps: sortedSteps.length,
            scheduleName: schedule.name || 'Untitled Schedule'
          })}\n\n`));

          // Execute each step and stream progress
          for (let stepIndex = 0; stepIndex < sortedSteps.length; stepIndex++) {
            const step = sortedSteps[stepIndex];

            // Send step start event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'step_start',
              stepIndex,
              step: step.order,
              modelName: step.modelName,
              actionName: step.actionName,
              query: step.query
            })}\n\n`));

            try {
              // Find the target model
              const targetModel = agent.models.find(m => m.id === step.modelId);
              if (!targetModel) {
                throw new Error(`Model with ID ${step.modelId} not found`);
              }

              // Find the action
              const action = agent.actions.find(a => a.id === step.actionId);
              if (!action) {
                throw new Error(`Action with ID ${step.actionId} not found`);
              }

              // Get all records for the model
              const allRecords = await getAgentRecordsByModelId(targetModel.id);

              // Send records found event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'records_found',
                stepIndex,
                totalRecords: allRecords.length,
                modelName: targetModel.name
              })}\n\n`));

              // Filter records based on query
              let recordsToProcess = allRecords;

              // NEW: Structured query object (preferred)
              if (step.query && typeof step.query === 'object' && step.query.filters) {
                const query = step.query as ScheduleQuery;
                recordsToProcess = allRecords.filter(record => evaluateQuery(record.data, query));
                console.log(`🔍 Query with ${query.filters.length} filters (${query.logic}) matched ${recordsToProcess.length}/${allRecords.length} records`);
              }
              // OLD: String query (backward compatibility)
              else if (step.query && typeof step.query === 'string' && step.query.trim()) {
                const queryLower = step.query.toLowerCase();

                recordsToProcess = allRecords.filter(record => {
                  const recordData = record.data;

                  // Try to parse structured queries like "field equals 'value'"
                  const equalsMatch = step.query.match(/(\w+)\s+equals\s+['"](.*?)['"]/i);
                  if (equalsMatch) {
                    const [, fieldName, expectedValue] = equalsMatch;
                    const actualValue = recordData[fieldName];
                    const match = actualValue === expectedValue || String(actualValue) === expectedValue;
                    console.log(`🔍 Query match for record ${record.id}:`, {
                      query: step.query,
                      fieldName,
                      expectedValue,
                      actualValue,
                      match
                    });
                    return match;
                  }

                  // Fallback to substring matching for other query formats
                  const recordDataStr = JSON.stringify(recordData).toLowerCase();
                  return recordDataStr.includes(queryLower) ||
                    queryLower.split(' ').some((keyword: string) => recordDataStr.includes(keyword));
                });

                console.log(`🔍 Query "${step.query}" matched ${recordsToProcess.length}/${allRecords.length} records`);
              }

              // Send filtered records event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'records_filtered',
                stepIndex,
                processedRecords: recordsToProcess.length,
                query: step.query
              })}\n\n`));

              // Execute the action on each matching record in parallel
              const recordResults = [];
              let completedRecords = 0;

              // Send batch processing start
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'batch_start',
                stepIndex,
                totalRecords: recordsToProcess.length
              })}\n\n`));

              // Process records in parallel with concurrency limit
              const BATCH_SIZE = 5; // Process up to 5 records simultaneously
              const batches = [];

              for (let i = 0; i < recordsToProcess.length; i += BATCH_SIZE) {
                batches.push(recordsToProcess.slice(i, i + BATCH_SIZE));
              }

              for (const batch of batches) {
                // Process this batch in parallel
                const batchPromises = batch.map(async (record, batchIndex) => {
                  const recordIndex = recordsToProcess.indexOf(record);

                  // Send record processing start
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'record_start',
                    stepIndex,
                    recordIndex,
                    recordId: record.id,
                    totalRecords: recordsToProcess.length
                  })}\n\n`));

                  try {
                    // Use the shared execution logic with streaming callback
                    const actionResult = await executeActionOnRecord(action, record, agent, (actionStepEvent) => {
                      // Forward action step events with additional context
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        ...actionStepEvent,
                        scheduleStepIndex: stepIndex,
                        recordIndex
                      })}\n\n`));
                    }, scheduleId);

                    const result = {
                      recordId: record.id,
                      success: true,
                      result: actionResult
                    };

                    // Send record success
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'record_complete',
                      stepIndex,
                      recordIndex,
                      recordId: record.id,
                      success: true,
                      completed: ++completedRecords,
                      total: recordsToProcess.length
                    })}\n\n`));

                    return result;

                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    const result = {
                      recordId: record.id,
                      success: false,
                      error: errorMessage
                    };

                    // Send record error
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'record_complete',
                      stepIndex,
                      recordIndex,
                      recordId: record.id,
                      success: false,
                      error: errorMessage,
                      completed: ++completedRecords,
                      total: recordsToProcess.length
                    })}\n\n`));

                    return result;
                  }
                });

                // Wait for this batch to complete before starting the next
                const batchResults = await Promise.all(batchPromises);
                recordResults.push(...batchResults);

                // Send batch progress update
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'batch_progress',
                  stepIndex,
                  completed: completedRecords,
                  total: recordsToProcess.length,
                  progress: Math.round((completedRecords / recordsToProcess.length) * 100)
                })}\n\n`));
              }

              // Send step completion
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'step_complete',
                stepIndex,
                step: step.order,
                success: true,
                modelName: targetModel.name,
                actionName: action.name,
                query: step.query,
                totalRecords: allRecords.length,
                processedRecords: recordsToProcess.length,
                recordResults
              })}\n\n`));

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              // Send step error
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'step_complete',
                stepIndex,
                step: step.order,
                success: false,
                error: errorMessage
              })}\n\n`));
            }
          }

          // Update lastRunAt and nextRunAt
          try {
            const intervalHours = Number(schedule.intervalHours || 24);
            const now = new Date();
            const nextRunAt = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
            // Prefer centralized updater in queries.ts
            await updateScheduleLastRun(scheduleId);
            // Also set nextRunAt and pause one-time schedules
            const { updateAgentSchedule } = await import('@/lib/db/agent-queries');
            await updateAgentSchedule(scheduleId, {
              nextRunAt: nextRunAt.toISOString(),
              ...(schedule.mode === 'once' ? { status: 'paused' as const } : {})
            });
          } catch (e) {
            console.error('Failed to update schedule timestamps:', e);
          }

          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete'
          })}\n\n`));

        } catch (error) {
          // Send global error
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Failed to run schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run schedule' },
      { status: 500 }
    );
  }
}

