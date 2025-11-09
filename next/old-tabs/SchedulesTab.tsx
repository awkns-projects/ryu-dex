'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ClockIcon, PlusIcon, PlayIcon, PlayCircleIcon, RepeatIcon, ListChecksIcon, SearchIcon, XIcon, PauseIcon, Trash2Icon, CalendarIcon, PlusCircleIcon, PencilIcon, ChevronDownIcon, ChevronRightIcon, CopyIcon } from 'lucide-react';
import { AgentData, AgentSchedule, AgentScheduleStep } from '@/lib/types';
import { ExecutionLogs } from '@/components/execution-logs';
import { ScheduleExecutionModal } from '@/components/schedule-execution-modal';
import { SchedulePreview } from '@/components/schedule-preview';
import { formatActionName } from '@/lib/utils';

interface SchedulesTabProps {
  agentData: AgentData;
  setAgentData: (data: AgentData) => void;
}

interface ScheduleStep {
  id?: string;
  modelId: string;
  query: string;
  actionId: string;
  order: number;
}

interface ScheduleFormState {
  id?: string;
  name: string;
  mode: 'once' | 'recurring';
  intervalHours: number;
  steps: ScheduleStep[];
  isSubmitting: boolean;
}

export function SchedulesTab({ agentData, setAgentData }: SchedulesTabProps) {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [newSchedule, setNewSchedule] = useState<ScheduleFormState>({
    name: '',
    mode: 'once',
    intervalHours: 1,
    steps: [],
    isSubmitting: false,
  });
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [expandedFormSteps, setExpandedFormSteps] = useState<Set<number>>(new Set());
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [executionScheduleName, setExecutionScheduleName] = useState('');
  const [currentExecutingSchedule, setCurrentExecutingSchedule] = useState<AgentSchedule | null>(null);

  const computeNextRunAt = (hours: number) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    return d.toISOString();
  };

  const resetScheduleForm = () => {
    setNewSchedule({
      name: '',
      mode: 'once',
      intervalHours: 1,
      steps: [],
      isSubmitting: false,
    });
    setExpandedFormSteps(new Set());
    setShowScheduleForm(true);
  };

  const handleDuplicateSchedule = (sourceSchedule: AgentSchedule) => {
    console.log('🔄 Duplicating schedule:', sourceSchedule);
    console.log('🔄 Source schedule steps:', sourceSchedule.steps);
    console.log('🔄 Source schedule steps length:', sourceSchedule.steps?.length);
    
    const duplicatedSteps = sourceSchedule.steps?.map(step => ({
      modelId: step.modelId,
      query: step.query || '',
      actionId: step.actionId,
      order: step.order,
    })) || [];
    
    console.log('🔄 Duplicated steps:', duplicatedSteps);
    
    setNewSchedule({
      name: `${sourceSchedule.name || 'Schedule'} (Copy)`,
      mode: sourceSchedule.mode,
      intervalHours: sourceSchedule.intervalHours ? Number(sourceSchedule.intervalHours) : 1,
      steps: duplicatedSteps,
      isSubmitting: false,
    });
    setExpandedFormSteps(new Set());
    setShowScheduleForm(true);
  };

  const handleEditSchedule = (schedule: AgentSchedule) => {
    setNewSchedule({
      id: schedule.id,
      name: schedule.name || '',
      mode: schedule.mode,
      intervalHours: schedule.intervalHours ? Number(schedule.intervalHours) : 1,
      steps: schedule.steps?.map(step => ({
        id: step.id,
        modelId: step.modelId,
        query: step.query || '',
        actionId: step.actionId,
        order: step.order,
      })) || [],
      isSubmitting: false,
    });
    setShowScheduleForm(true);
  };

  const handleAddStep = () => {
    const newStepIndex = newSchedule.steps.length;
    setNewSchedule(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          modelId: agentData.models[0]?.id || '',
          query: '',
          actionId: '',
          order: prev.steps.length,
        },
      ],
    }));
    // Auto-expand the new step
    setExpandedFormSteps(prev => new Set([...prev, newStepIndex]));
  };

  const handleUpdateStep = (index: number, updates: Partial<ScheduleStep>) => {
    setNewSchedule(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      ),
    }));
  };

  const handleRemoveStep = (index: number) => {
    setNewSchedule(prev => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, order: i })),
    }));
    // Update expanded steps after removal
    setExpandedFormSteps(prev => {
      const newSet = new Set<number>();
      prev.forEach(stepIndex => {
        if (stepIndex < index) {
          newSet.add(stepIndex);
        } else if (stepIndex > index) {
          newSet.add(stepIndex - 1);
        }
      });
      return newSet;
    });
  };

  const toggleFormStepExpanded = (stepIndex: number) => {
    setExpandedFormSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const handleRunScheduleNow = async () => {
    console.log('🚀 handleRunScheduleNow called with newSchedule:', newSchedule);
    console.log('🚀 newSchedule.steps.length:', newSchedule.steps.length);
    
    if (newSchedule.steps.length === 0) {
      console.warn('⚠️ Cannot run schedule - no steps configured');
      return;
    }
    
    // Open the execution modal for new schedule
    setCurrentExecutingSchedule(null);
    setExecutionScheduleName(newSchedule.name || 'Untitled Schedule');
    console.log('🚀 Opening modal with steps:', newSchedule.steps);
    setShowExecutionModal(true);
  };

  const executeScheduleNow = async () => {
    try {
      // First create the schedule
      const response = await fetch('/api/agent/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          name: newSchedule.name,
          mode: 'once',
          steps: newSchedule.steps,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create schedule: ${await response.text()}`);
      }

      const { schedule } = await response.json();
      
      // Update schedules state and parent agentData
      const updatedSchedules = [schedule, ...schedules];
      setSchedules(updatedSchedules);
      setAgentData({ ...agentData, schedules: updatedSchedules });
      
      // Reset form after successful schedule creation
      setNewSchedule({
        name: '',
        mode: 'once',
        intervalHours: 1,
        steps: [],
        isSubmitting: false,
      });
      setShowScheduleForm(false);

      // Return the schedule ID for streaming execution
      return { scheduleId: schedule.id };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const handleRunSpecificSchedule = async (schedule: AgentSchedule) => {
    console.log('🚀 handleRunSpecificSchedule called with schedule:', schedule);
    console.log('🚀 schedule.steps:', schedule.steps);
    
    // Open the execution modal for existing schedule
    setCurrentExecutingSchedule(schedule);
    setExecutionScheduleName(schedule.name || 'Untitled Schedule');
    setShowExecutionModal(true);
  };

  const executeCurrentSchedule = async () => {
    if (currentExecutingSchedule) {
      // Execute existing schedule - just return the schedule ID
      return { scheduleId: currentExecutingSchedule.id };
    } else {
      // Execute new schedule (create it first, then return schedule ID)
      return executeScheduleNow();
    }
  };

  const getCurrentScheduleSteps = () => {
    if (currentExecutingSchedule) {
      const steps = currentExecutingSchedule.steps?.map(step => ({
        id: step.id,
        modelId: step.modelId,
        query: step.query || '',
        actionId: step.actionId,
        order: step.order,
      })) || [];
      console.log('🔍 Existing schedule steps:', steps);
      return steps;
    }
    console.log('🔍 New schedule steps:', newSchedule.steps);
    return newSchedule.steps;
  };

  const handleSaveSchedule = async () => {
    if (newSchedule.steps.length === 0 || newSchedule.mode !== 'recurring') return;
    setNewSchedule(prev => ({ ...prev, isSubmitting: true }));
    try {
      const response = await fetch(
        newSchedule.id 
          ? `/api/agent/schedule/${newSchedule.id}`
          : '/api/agent/schedule',
        {
          method: newSchedule.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: agentData.id,
            name: newSchedule.name,
            mode: newSchedule.mode,
            intervalHours: newSchedule.intervalHours,
            steps: newSchedule.steps,
          }),
        }
      );
      if (response.ok) {
        const { schedule } = await response.json();
        const updatedSchedules = newSchedule.id 
          ? schedules.map(s => s.id === newSchedule.id ? schedule : s)
          : [schedule, ...schedules];
        
        setSchedules(updatedSchedules);
        setAgentData({ ...agentData, schedules: updatedSchedules });
        setNewSchedule({
          name: '',
          mode: 'once',
          intervalHours: 1,
          steps: [],
          isSubmitting: false,
        });
        setShowScheduleForm(false);
      } else {
        console.error('Failed to save schedule:', await response.text());
        setNewSchedule(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setNewSchedule(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const toggleSchedule = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    try {
      const response = await fetch(`/api/agent/schedule/${id}/toggle`, {
        method: 'POST',
      });
      if (response.ok) {
        const { schedule: updatedSchedule } = await response.json();
        const updatedSchedules = schedules.map(s => s.id === id ? updatedSchedule : s);
        setSchedules(updatedSchedules);
        setAgentData({ ...agentData, schedules: updatedSchedules });
      } else {
        console.error('Failed to toggle schedule:', await response.text());
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/agent/schedule/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedSchedules = schedules.filter(s => s.id !== id);
        setSchedules(updatedSchedules);
        setAgentData({ ...agentData, schedules: updatedSchedules });
      } else {
        console.error('Failed to delete schedule:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleScheduleClick = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId === selectedScheduleId ? null : scheduleId);
  };

  const toggleScheduleExpanded = (scheduleId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  // Load schedules on mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch(`/api/agent/schedule?agentId=${agentData.id}`);
        if (response.ok) {
          const { schedules: loadedSchedules } = await response.json();
          console.log('📥 Loaded schedules:', loadedSchedules);
          loadedSchedules?.forEach((schedule: any, index: number) => {
            console.log(`📥 Schedule ${index + 1}:`, schedule.name, 'Steps:', schedule.steps?.length, schedule.steps);
          });
          setSchedules(loadedSchedules || []);
          setAgentData({ ...agentData, schedules: loadedSchedules || [] });
        } else {
          console.error('Failed to load schedules:', await response.text());
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
      } finally {
        setIsLoadingSchedules(false);
      }
    };
    loadSchedules();
  }, [agentData.id]);

  return (
    <div className="space-y-4">
      <Card className='border-none'>
        <CardHeader className='px-0 pb-3'>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClockIcon className="h-4 w-4" />
            Schedules
          </CardTitle>
          <CardDescription className="text-sm">
            Run actions on records matched by a semantic query, once or on a recurring interval
          </CardDescription>
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  New Schedule
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={resetScheduleForm}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create from scratch
                </DropdownMenuItem>
                {schedules.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Duplicate existing:
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {/* Run Once Schedules */}
                      {schedules.filter(s => s.mode === 'once').length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                            Run Once
                          </div>
                          {schedules.filter(s => s.mode === 'once').map(schedule => (
                            <DropdownMenuItem 
                              key={schedule.id}
                              onClick={() => handleDuplicateSchedule(schedule)}
                              className="pl-4"
                            >
                              <CopyIcon className="h-4 w-4 mr-2" />
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{schedule.name || 'Untitled Schedule'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {schedule.steps?.length || 0} steps
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      
                      {/* Recurring Schedules */}
                      {schedules.filter(s => s.mode === 'recurring').length > 0 && (
                        <>
                          {schedules.filter(s => s.mode === 'once').length > 0 && (
                            <DropdownMenuSeparator />
                          )}
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                            Recurring
                          </div>
                          {schedules.filter(s => s.mode === 'recurring').map(schedule => (
                            <DropdownMenuItem 
                              key={schedule.id}
                              onClick={() => handleDuplicateSchedule(schedule)}
                              className="pl-4"
                            >
                              <CopyIcon className="h-4 w-4 mr-2" />
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{schedule.name || 'Untitled Schedule'}</div>
                                <div className="text-xs text-muted-foreground">
                                  Every {schedule.intervalHours}h • {schedule.steps?.length || 0} steps
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          {/* Create/Edit Schedule Form */}
          {showScheduleForm && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  {newSchedule.id ? 'Edit Schedule' : 'Create Schedule'}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduleForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="schedule-name">Name</Label>
                <Input
                  id="schedule-name"
                  placeholder="e.g., Daily Market Analysis"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Run Mode</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                  <Button
                    variant={newSchedule.mode === 'once' ? 'default' : 'outline'}
                    size="default"
                    onClick={() => setNewSchedule(prev => ({ ...prev, mode: 'once' }))}
                    className="gap-2 flex-1 sm:flex-none justify-center h-10"
                  >
                    <PlayCircleIcon className="h-4 w-4" />
                    Run once now
                  </Button>
                  <Button
                    variant={newSchedule.mode === 'recurring' ? 'default' : 'outline'}
                    size="default"
                    onClick={() => setNewSchedule(prev => ({ ...prev, mode: 'recurring' }))}
                    className="gap-2 flex-1 sm:flex-none justify-center h-10"
                  >
                    <RepeatIcon className="h-4 w-4" />
                    Recurring
                  </Button>
                </div>
              </div>

              {newSchedule.mode === 'recurring' && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={String(newSchedule.intervalHours)}
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, intervalHours: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,6,8,12,24].map(h => (
                        <SelectItem key={h} value={String(h)}>Every {h} hour{h>1?'s':''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next run: {new Date(computeNextRunAt(newSchedule.intervalHours)).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Steps */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <Label>Steps</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>
                {newSchedule.steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add steps to define the schedule workflow</p>
                ) : (
                  <div className="space-y-2">
                    {newSchedule.steps.map((step, index) => {
                      const isExpanded = expandedFormSteps.has(index);
                      const selectedModel = agentData.models.find(m => m.id === step.modelId);
                      const selectedAction = agentData.actions.find(a => a.id === step.actionId);
                      
                      return (
                        <div key={index} className="border rounded-lg bg-muted/30">
                          {/* Collapsed Step Header */}
                          <div 
                            className="p-3 cursor-pointer flex items-center justify-between min-h-[48px]"
                            onClick={() => toggleFormStepExpanded(index)}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                              )}
                              <h5 className="text-sm font-medium flex-shrink-0">Step {index + 1}</h5>
                              {!isExpanded && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                                  {selectedModel && (
                                    <>
                                      <span className="truncate">{selectedModel.name}</span>
                                      {selectedAction && (
                                        <>
                                          <span className="flex-shrink-0">→</span>
                                          <span className="truncate">{selectedAction.title || formatActionName(selectedAction.name)}</span>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStep(index);
                              }}
                              className="h-8 w-8 p-0 text-destructive flex-shrink-0 ml-2"
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Expanded Step Details */}
                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-3 border-t">
                              <div>
                                <Label>Model</Label>
                                <Select
                                  value={step.modelId}
                                  onValueChange={(value) => handleUpdateStep(index, { modelId: value, actionId: '' })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {agentData.models.map(m => (
                                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Semantic where search</Label>
                                <Input
                                  placeholder="e.g., friendly pets priced over 100"
                                  value={step.query}
                                  onChange={(e) => handleUpdateStep(index, { query: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Action</Label>
                                <Select
                                  value={step.actionId}
                                  onValueChange={(value) => handleUpdateStep(index, { actionId: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {agentData.actions
                                      .filter(a => {
                                        const model = agentData.models.find(m => m.id === step.modelId);
                                        return model && (a.targetModel === model.name || a.targetModelId === model.id);
                                      })
                                      .map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {newSchedule.mode === 'once' ? (
                  <Button
                    onClick={handleRunScheduleNow}
                    disabled={newSchedule.steps.length === 0 || newSchedule.isSubmitting}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <PlayCircleIcon className="h-4 w-4" />
                    Run Now
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveSchedule}
                    disabled={newSchedule.steps.length === 0 || newSchedule.isSubmitting}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {newSchedule.id ? 'Update Schedule' : 'Save Schedule'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Schedules List */}
          {isLoadingSchedules ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading schedules...</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Saved Schedules</h4>
              
              {/* Run Once Schedules */}
              {schedules.filter(s => s.mode === 'once').length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <PlayCircleIcon className="h-4 w-4 text-blue-600" />
                    <h5 className="text-sm font-medium text-blue-700">Run Once Schedules</h5>
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                      {schedules.filter(s => s.mode === 'once').length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {schedules.filter(s => s.mode === 'once').map(schedule => (
                      <SchedulePreview
                        key={schedule.id}
                        schedule={schedule}
                        agentData={agentData}
                        isExpanded={expandedSchedules.has(schedule.id)}
                        isSelected={selectedScheduleId === schedule.id}
                        variant="full"
                        onToggleExpanded={toggleScheduleExpanded}
                        onSelect={handleScheduleClick}
                        onRun={handleRunSpecificSchedule}
                        onEdit={handleEditSchedule}
                        onDelete={deleteSchedule}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recurring Schedules */}
              {schedules.filter(s => s.mode === 'recurring').length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RepeatIcon className="h-4 w-4 text-green-600" />
                    <h5 className="text-sm font-medium text-green-700">Recurring Schedules</h5>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      {schedules.filter(s => s.mode === 'recurring').length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {schedules.filter(s => s.mode === 'recurring').map(schedule => (
                      <SchedulePreview
                        key={schedule.id}
                        schedule={schedule}
                        agentData={agentData}
                        isExpanded={expandedSchedules.has(schedule.id)}
                        isSelected={selectedScheduleId === schedule.id}
                        variant="full"
                        onToggleExpanded={toggleScheduleExpanded}
                        onSelect={handleScheduleClick}
                        onEdit={handleEditSchedule}
                        onDelete={deleteSchedule}
                        onToggleStatus={toggleSchedule}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No schedules created yet</p>
              <p className="text-xs mt-1">Click "New Schedule" to create one</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Logs */}
      {selectedScheduleId && (
        <ExecutionLogs
          title="Schedule Execution History"
          fetchUrl={`/api/agent/schedule/${selectedScheduleId}/executions`}
          emptyMessage="No executions found for this schedule"
        />
      )}

      {/* Execution Modal */}
      <ScheduleExecutionModal
        isOpen={showExecutionModal}
        onClose={() => {
          setShowExecutionModal(false);
          setCurrentExecutingSchedule(null);
        }}
        scheduleName={executionScheduleName}
        steps={getCurrentScheduleSteps()}
        onExecute={executeCurrentSchedule}
      />

      {/* Debug Info */}
      {showExecutionModal && (
        <div style={{ display: 'none' }}>
          Debug: Steps passed to modal: {JSON.stringify(getCurrentScheduleSteps())}
        </div>
      )}
    </div>
  );
}

export default SchedulesTab; 