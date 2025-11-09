"use client"

import { use, useEffect, useState } from "react"
import { AnimatePresence } from "motion/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText, Zap, Database, Network, AlertCircle, ChevronDown, ChevronRight, Calendar,
  Plus, List, Loader2, LinkIcon, CheckCircle2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api, authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Loading } from "@/components/ui/loading"
import { ScheduleExecution } from "@/components/schedule-execution"
import { SchedulePreview } from "@/components/schedule-preview"
import {
  initiateAgentGoogleOAuth,
  initiateAgentFacebookOAuth,
  initiateAgentXOAuth,
  initiateAgentInstagramOAuth,
  initiateAgentThreadsOAuth,
  hasValidOAuthTokens
} from "@/lib/agent-oauth.web"

interface AgentData {
  id?: string
  name: string
  title?: string
  description?: string
  image?: string
  models: AgentModel[]
  actions: AgentAction[]
  connections?: AgentConnection[]
  features?: AgentFeature[]
  schedules?: AgentSchedule[]
  agent?: {
    id: string
    name: string
    title?: string
    description?: string
    createdAt?: string
    templateId?: string
    userId?: string
  }
}

interface AgentConnection {
  id: string
  name: string
  title: string
  provider: string
  description: string
  icon?: string
  scopes?: string[]
  required?: boolean
}

interface AgentFeature {
  icon: string
  title: string
  description: string | {
    feature: string
    data: string
    action: string
  }
  forms?: AgentFeatureForm[]
  models?: AgentFeatureModel[]
  schedules?: AgentFeatureSchedule[]
}

interface AgentFeatureForm {
  formId: string
  formName: string
  formType?: 'new' | 'edit'
  whenToUse?: string
  modelName: string
  fields: string[]
  scheduleId?: string
}

interface AgentFeatureModel {
  modelName: string
  fields: string[]
}

interface AgentFeatureSchedule {
  name: string
  description?: string
  mode: 'once' | 'recurring'
  intervalHours?: number
  steps: {
    modelName: string
    actionName: string
    actionTitle?: string
    query?: string
    order: number
  }[]
}

interface AgentSchedule {
  id?: string
  name: string
  mode: 'once' | 'recurring'
  intervalHours?: string
  status?: 'active' | 'paused'
  steps?: AgentScheduleStep[]
}

interface ScheduleFilter {
  field: string
  operator: string
  value: any
}

interface ScheduleQuery {
  filters: ScheduleFilter[]
  logic: 'AND' | 'OR'
}

interface AgentScheduleStep {
  id?: string
  modelId?: string
  modelName?: string
  actionId?: string
  actionName?: string
  query?: ScheduleQuery | string  // NEW: Structured query OR legacy string
  order: number
}

interface AgentField {
  name: string
  title?: string
  type: string
  required?: boolean
  description?: string
  enumValues?: string[]
  referencesModel?: string
  referencesField?: string
  referenceType?: 'to_one' | 'to_many'
  oauthProvider?: string
  oauthScopes?: string[]
}

interface AgentModel {
  id: string
  name: string
  description?: string
  fields: AgentField[]
  forms?: AgentForm[]
  records?: any[]
}

interface AgentForm {
  id: string
  name: string
  formName?: string
  description?: string
  icon?: string
  fields: string[]
}

interface AgentAction {
  id: string
  name: string
  title?: string
  description?: string
  emoji?: string
}

export default function AgentHomePage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFeatures, setExpandedFeatures] = useState<Record<number, boolean>>({})
  const [expandedConnections, setExpandedConnections] = useState(false)

  // Form modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [showRecordSelector, setShowRecordSelector] = useState(false)
  const [selectedForm, setSelectedForm] = useState<AgentFeatureForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Schedule execution states
  const [showScheduleExecution, setShowScheduleExecution] = useState(false)
  const [executionScheduleId, setExecutionScheduleId] = useState<string | null>(null)
  const [scheduleExecutionComplete, setScheduleExecutionComplete] = useState(false)
  const [enrichedSchedules, setEnrichedSchedules] = useState<AgentSchedule[]>([])

  const toggleFeature = (index: number) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Handle form click
  const handleFormClick = async (form: AgentFeatureForm) => {
    setSelectedForm(form)
    setFormData({})
    setSelectedRecordId(null)

    // Determine form type (default to 'new' if not specified)
    const formType = form.formType || 'new'

    if (formType === 'new') {
      // Show create form directly
      setShowFormModal(true)
      setShowRecordSelector(false)
    } else {
      // For edit forms, show record selector
      // First, fetch records for the model
      try {
        const model = agent?.models.find(m => m.name === form.modelName)
        if (model && model.id) {
          // Records are already loaded in agent.models
          setShowRecordSelector(true)
          setShowFormModal(false)
        }
      } catch (error) {
        console.error('Failed to load records:', error)
      }
    }
  }

  // Handle record selection for edit forms
  const handleRecordSelect = (recordId: string) => {
    const model = agent?.models.find(m => m.name === selectedForm?.modelName)
    const record = model?.records?.find(r => r.id === recordId)

    if (record && selectedForm) {
      setSelectedRecordId(recordId)
      // Pre-fill form with existing data
      const initialData: Record<string, any> = {}
      selectedForm.fields.forEach(fieldName => {
        if (record[fieldName] !== undefined) {
          initialData[fieldName] = record[fieldName]
        }
      })
      setFormData(initialData)
      setShowRecordSelector(false)
      setShowFormModal(true)
    }
  }

  // Check if field is OAuth
  const isOAuthField = (field: AgentField): boolean => {
    return !!(field as any)?.oauthProvider || field.type === 'oauth'
  }

  // Check if OAuth is connected
  const isOAuthConnected = (fieldName: string): boolean => {
    if (!agent || !selectedRecordId) return false
    const model = agent.models.find(m => m.name === selectedForm?.modelName)
    const record = model?.records?.find((r: any) => r.id === selectedRecordId)
    if (!record) return false
    return hasValidOAuthTokens(record[fieldName])
  }

  // Handle OAuth button click
  const handleOAuthConnect = async (field: AgentField) => {
    const provider = (field as any).oauthProvider
    const scopes = (field as any).oauthScopes || []

    try {
      if (provider === 'google') {
        await initiateAgentGoogleOAuth(agentId, scopes)
      } else if (provider === 'facebook') {
        await initiateAgentFacebookOAuth(agentId, scopes)
      } else if (provider === 'x') {
        await initiateAgentXOAuth(agentId, scopes)
      } else if (provider === 'instagram') {
        await initiateAgentInstagramOAuth(agentId, scopes)
      } else if (provider === 'threads') {
        await initiateAgentThreadsOAuth(agentId, scopes)
      } else {
        alert(`Unknown OAuth provider: ${provider}`)
        return
      }

      alert(`Opening ${provider} authorization. Complete the process and reload this page.`)
    } catch (error) {
      console.error('OAuth error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start OAuth flow'
      alert(`OAuth Error:\n\n${errorMessage}\n\n💡 Check console for details or see OAUTH_TROUBLESHOOTING.md`)
    }
  }

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!selectedForm || !agent) return

    setFormSubmitting(true)

    try {
      const model = agent.models.find(m => m.name === selectedForm.modelName)
      if (!model) {
        throw new Error('Model not found')
      }

      if (!model.id) {
        throw new Error('Model ID is missing')
      }

      // Agent ID might be in agent.id or agent.agent.id depending on data structure
      const actualAgentId = agent.id || (agent as any).agent?.id || agentId

      if (!actualAgentId) {
        throw new Error('Agent ID is missing')
      }

      console.log('📝 Submitting form:', {
        formType: selectedForm.formType,
        modelName: selectedForm.modelName,
        agentId: actualAgentId,
        modelId: model.id,
        formData,
        selectedRecordId,
        agentStructure: { hasAgentId: !!agent.id, hasNestedId: !!(agent as any).agent?.id },
        hasModelId: !!model.id,
        hasFormData: Object.keys(formData).length > 0
      })

      if (selectedForm.formType === 'edit' && selectedRecordId) {
        // Update existing record
        console.log('🔄 Updating record:', selectedRecordId)
        await authenticatedFetch({
          path: `/api/agent/record/${selectedRecordId}`,
          method: 'PATCH',
          body: JSON.stringify({ data: formData })
        })
        console.log('✅ Record updated')
      } else {
        // Create new record - use api.post like the data page
        const requestBody = {
          agentId: actualAgentId,
          modelId: model.id,
          data: formData
        }

        console.log('➕ Creating new record with request body:', JSON.stringify(requestBody, null, 2))

        const result = await api.post('/api/agent/record', requestBody)
        console.log('✅ Record created:', result)
      }

      // Close form modal
      setShowFormModal(false)
      setFormData({})

      // Reload agent data first
      const response = await api.get(`/api/agent?id=${agentId}`)

      // Flatten records
      const modelsWithFlattenedRecords = response.models?.map((model: any) => ({
        ...model,
        records: model.records?.map((record: any) => ({
          ...record.data,
          id: record.id,
          modelId: record.modelId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })) || []
      })) || []

      const flattenedData = {
        ...response,
        models: modelsWithFlattenedRecords
      }

      setAgent(flattenedData)

      // If form has a linked schedule, show schedule execution
      if (selectedForm.scheduleId) {
        const schedule = response.schedules?.find((s: AgentSchedule) =>
          s.name?.toLowerCase().replace(/\s+/g, '-') === selectedForm.scheduleId ||
          s.id === selectedForm.scheduleId
        )
        // Only use schedules with valid UUID IDs (from database, not template)
        const isValidUUID = schedule?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schedule.id)
        if (schedule && isValidUUID) {
          setExecutionScheduleId(schedule.id)
          setScheduleExecutionComplete(false)
          setShowScheduleExecution(true)
        } else {
          console.warn('⚠️ Schedule found but has no valid database ID:', schedule)
          alert('This schedule needs to be created in the database before it can be executed. Please create the schedule first.')
        }
      }

    } catch (error) {
      console.error('Failed to submit form:', error)

      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication')) {
        alert('Your session has expired. Please log in again.')
        // Redirect to login
        window.location.href = '/login'
      } else {
        alert('Failed to submit form. Please try again.')
      }
    } finally {
      setFormSubmitting(false)
    }
  }

  // Execute schedule (returns schedule ID for ScheduleExecution component)
  const executeSchedule = async () => {
    if (!executionScheduleId) {
      throw new Error('No schedule selected')
    }
    console.log('🚀 Executing schedule:', executionScheduleId)
    console.log('📋 Schedule steps to execute:', getScheduleSteps())
    return { scheduleId: executionScheduleId }
  }

  // Load enriched schedules when execution modal opens
  useEffect(() => {
    if (showScheduleExecution && agentId) {
      const loadEnrichedSchedules = async () => {
        try {
          const actualAgentId = agent?.id || (agent as any)?.agent?.id || agentId
          console.log('🔍 Loading enriched schedules for agent:', actualAgentId)
          const response = await fetch(`/api/agent/schedule?agentId=${actualAgentId}`)
          if (response.ok) {
            const { schedules } = await response.json()
            console.log('📅 Loaded enriched schedules:', schedules)
            console.log('📋 First schedule steps:', schedules?.[0]?.steps)
            setEnrichedSchedules(schedules || [])
          } else {
            console.error('Failed to fetch schedules:', response.status, response.statusText)
            setEnrichedSchedules(agent?.schedules || [])
          }
        } catch (error) {
          console.error('Failed to load enriched schedules:', error)
          // Fallback to original schedules
          setEnrichedSchedules(agent?.schedules || [])
        }
      }
      loadEnrichedSchedules()
    }
  }, [showScheduleExecution, agentId, agent])

  // Get schedule steps for ScheduleExecution component
  const getScheduleSteps = () => {
    if (!executionScheduleId) return []

    // Use enriched schedules if available, otherwise fallback to agent schedules
    const schedulesSource = enrichedSchedules.length > 0 ? enrichedSchedules : (agent?.schedules || [])
    const schedule = schedulesSource.find(s => s.id === executionScheduleId)
    if (!schedule?.steps) return []

    console.log('📋 Schedule steps for execution:', schedule.steps)

    return schedule.steps.map(step => ({
      id: step.id,
      modelId: step.modelId || '',
      query: step.query || '',
      actionId: step.actionId || '',
      order: step.order,
    }))
  }

  // Get schedule name
  const getScheduleName = () => {
    if (!executionScheduleId) return 'Schedule'
    const schedulesSource = enrichedSchedules.length > 0 ? enrichedSchedules : (agent?.schedules || [])
    const schedule = schedulesSource.find(s => s.id === executionScheduleId)
    return schedule?.name || 'Schedule'
  }

  useEffect(() => {
    const startTime = Date.now()
    const fetchAgent = async () => {
      try {
        const response = await api.get(`/api/agent?id=${agentId}`)
        console.log('📦 Loaded agent:', response)
        console.log('🎯 Actions with steps:', response.actions?.map((a: any) => ({
          name: a.name,
          stepsCount: a.steps?.length || 0,
          steps: a.steps?.map((s: any) => ({
            name: s.name,
            type: s.type,
            hasConfig: !!s.config
          }))
        })))

        // Flatten records for easier access (same as data page)
        const modelsWithFlattenedRecords = response.models?.map((model: any) => ({
          ...model,
          records: model.records?.map((record: any) => ({
            ...record.data,
            id: record.id,
            modelId: record.modelId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          })) || []
        })) || []

        const flattenedData = {
          ...response,
          models: modelsWithFlattenedRecords
        }

        setAgent(flattenedData)
      } catch (error) {
        console.error("Failed to fetch agent:", error)
        setError(error instanceof Error ? error.message : "Failed to load agent")
      } finally {
        // Ensure loading screen shows for at least 2 seconds for animation
        const elapsed = Date.now() - startTime
        const minDisplayTime = 2000
        const delay = Math.max(0, minDisplayTime - elapsed)

        setTimeout(() => {
          setLoading(false)
        }, delay)
      }
    }

    fetchAgent()
  }, [agentId])


  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loading key="loading" text="Loading agent..." />}
      </AnimatePresence>

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h3 className="text-lg font-semibold">Failed to Load Agent</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && !agent && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="text-7xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold">No Agent Selected</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Select an agent from the sidebar to view details and manage your data
          </p>
        </div>
      )}

      {!loading && !error && agent && (
        <div className="space-y-8 py-6 max-w-4xl mx-auto">
          {/* Educational Section */}
          <div className="text-center mb-8 px-4">
            <h1 className="text-3xl md:text-4xl font-light mb-3 tracking-tight">
              Your AI <span className="font-medium italic instrument">Agent</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI Agents are intelligent assistants that automate your workflows.
              Configure data models, connect APIs, and schedule automated actions to streamline your processes.
              Your agent works 24/7 to handle repetitive tasks and keep your data organized.
            </p>
          </div>

          {/* Agent Header */}
          <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {agent.image ? (
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <span className="text-5xl">🤖</span>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                {agent.name || agent.agent?.name || "Agent"}
              </h1>
              {(agent.title || agent.agent?.title) && (
                <p className="text-lg text-muted-foreground font-medium">
                  {agent.title || agent.agent?.title}
                </p>
              )}
              {(agent.description || agent.agent?.description) && (
                <p className="text-muted-foreground max-w-2xl">
                  {agent.description || agent.agent?.description}
                </p>
              )}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="space-y-6">
            {/* <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">How It Works</h2>
            </div> */}



            {/* Section 2: Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Features
              </h3>

              {agent.features && agent.features.length > 0 ? (
                <div className="space-y-4">
                  {agent.features.map((feature, featureIndex) => {
                    const isExpanded = expandedFeatures[featureIndex]
                    const featureForms = feature.forms || []
                    const featureModels = feature.models || []
                    const featureSchedules = feature.schedules || []

                    return (
                      <Card key={featureIndex} className="glass-effect overflow-hidden">
                        {/* Feature Header */}
                        <div
                          className="p-6 cursor-pointer hover:bg-muted/5 transition-colors"
                          onClick={() => toggleFeature(featureIndex)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-3xl">{feature.icon || '⚡'}</div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold">{feature.title}</h3>
                                {typeof feature.description === 'string' ? (
                                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                                ) : (
                                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                    {feature.description?.feature && (
                                      <p><strong>Feature:</strong> {feature.description.feature}</p>
                                    )}
                                    {feature.description?.data && (
                                      <p><strong>Data:</strong> {feature.description.data}</p>
                                    )}
                                    {feature.description?.action && (
                                      <p><strong>Action:</strong> {feature.description.action}</p>
                                    )}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {featureForms.length > 0 && (
                                    <Badge variant="secondary" className="gap-1">
                                      <FileText className="w-3 h-3" />
                                      {featureForms.length} {featureForms.length === 1 ? 'Form' : 'Forms'}
                                    </Badge>
                                  )}
                                  {featureSchedules.length > 0 && (
                                    <Badge variant="secondary" className="gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {featureSchedules.length} {featureSchedules.length === 1 ? 'Schedule' : 'Schedules'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Feature Details */}
                        {isExpanded && (
                          <div className="border-t border-border">
                            <div className="p-6 space-y-6">
                              {/* Forms */}
                              {featureForms.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Forms to Fill
                                  </h4>
                                  <div className="grid gap-3">
                                    {featureForms.map((form: any, idx: number) => {
                                      // Find linked schedule for this form
                                      const linkedSchedule = form.scheduleId
                                        ? featureSchedules.find((s: any) => s.scheduleId === form.scheduleId)
                                        : null;

                                      // Check if this is a Workspace form - show records inline
                                      const isWorkspaceForm = form.modelName === 'Workspace';
                                      const workspaceModel = isWorkspaceForm ? agent.models.find(m => m.name === 'Workspace') : null;
                                      const workspaceRecords = workspaceModel?.records || [];

                                      return (
                                        <Card
                                          key={idx}
                                          className={cn(
                                            "p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/20",
                                            !isWorkspaceForm && "cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                                          )}
                                          onClick={!isWorkspaceForm ? () => handleFormClick(form) : undefined}
                                        >
                                          <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="font-medium flex items-center gap-2">
                                                  {form.formName}
                                                  <Badge variant="secondary" className="text-xs">
                                                    {form.formType || 'new'}
                                                  </Badge>
                                                </div>
                                                {!isWorkspaceForm && (
                                                  <div className="text-xs text-muted-foreground mt-1">
                                                    Model: {form.modelName}
                                                  </div>
                                                )}
                                                {form.whenToUse && (
                                                  <div className="text-xs text-muted-foreground italic mt-1">
                                                    {form.whenToUse}
                                                  </div>
                                                )}
                                                {linkedSchedule && (
                                                  <div className="mt-3 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
                                                    <div className="flex items-start gap-2">
                                                      <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                                                      <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                                          Auto-triggers: {linkedSchedule.name}
                                                        </div>
                                                        {linkedSchedule.description && (
                                                          <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                                            {linkedSchedule.description}
                                                          </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-purple-600 dark:text-purple-400">
                                                          <Badge variant="outline" className="text-xs bg-purple-100/50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700">
                                                            {linkedSchedule.mode === 'recurring'
                                                              ? `Recurring: every ${linkedSchedule.intervalHours}h`
                                                              : 'Runs once after submit'}
                                                          </Badge>
                                                          {linkedSchedule.steps && linkedSchedule.steps.length > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                              • {linkedSchedule.steps.length} {linkedSchedule.steps.length === 1 ? 'step' : 'steps'}
                                                            </span>
                                                          )}
                                                        </div>
                                                        {linkedSchedule.steps && linkedSchedule.steps.length > 0 && (
                                                          <div className="mt-2 space-y-1">
                                                            {linkedSchedule.steps.map((step: any, stepIdx: number) => (
                                                              <div key={stepIdx} className="flex items-center gap-1.5 text-xs">
                                                                <span className="text-purple-500">→</span>
                                                                <span className="text-muted-foreground">
                                                                  {step.actionTitle || step.actionName || 'Processing step'}
                                                                </span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Show Workspace Records Inline with Connection Status */}
                                                {isWorkspaceForm && workspaceRecords.length > 0 && (
                                                  <div className="mt-4 space-y-2">
                                                    {workspaceRecords.map((record: any) => {
                                                      // Get OAuth fields from form
                                                      const oauthFields = workspaceModel?.fields.filter(f =>
                                                        form.fields.includes(f.name) && (f.type === 'oauth' || f.oauthProvider)
                                                      ) || [];

                                                      return (
                                                        <div
                                                          key={record.id}
                                                          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-border cursor-pointer hover:border-primary/50 transition-colors"
                                                          onClick={() => {
                                                            setSelectedRecordId(record.id);
                                                            setFormData(record);
                                                            setSelectedForm(form);
                                                            setShowFormModal(true);
                                                          }}
                                                        >
                                                          <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                              <div className="font-medium text-sm">
                                                                {record.name || 'Workspace'}
                                                              </div>
                                                              {record.description && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                  {record.description}
                                                                </div>
                                                              )}

                                                              {/* Connection Status Badges */}
                                                              <div className="flex flex-wrap gap-2 mt-2">
                                                                {oauthFields.map((field: any) => {
                                                                  const isConnected = hasValidOAuthTokens(record[field.name]);
                                                                  return (
                                                                    <div
                                                                      key={field.name}
                                                                      className={cn(
                                                                        "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
                                                                        isConnected
                                                                          ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                                                                          : "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                                                                      )}
                                                                    >
                                                                      {isConnected ? (
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                      ) : (
                                                                        <LinkIcon className="w-3 h-3" />
                                                                      )}
                                                                      <span>{field.title || field.name}</span>
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                              {!isWorkspaceForm && (
                                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                                  {form.formType === 'edit' ? (
                                                    <List className="w-4 h-4" />
                                                  ) : (
                                                    <Plus className="w-4 h-4" />
                                                  )}
                                                </Button>
                                              )}
                                            </div>
                                            {form.fields && form.fields.length > 0 && !isWorkspaceForm && (
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                {form.fields.map((field: string, fieldIdx: number) => (
                                                  <Badge key={fieldIdx} variant="outline" className="text-xs">
                                                    {field}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No features configured for this agent
                </p>
              )}
            </div>


          </div>
        </div>
      )}

      {/* Record Selector Modal (for edit forms) */}
      <Dialog open={showRecordSelector} onOpenChange={setShowRecordSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select {selectedForm?.modelName} to Edit</DialogTitle>
            <DialogDescription>
              Choose a record to edit with the "{selectedForm?.formName}" form
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(() => {
              const model = agent?.models.find(m => m.name === selectedForm?.modelName)
              const records = model?.records || []

              return records.map((record: any) => {
                // Get first field value for display
                const displayValue = model?.fields?.[0]
                  ? record[model.fields[0].name]
                  : Object.values(record).find((v: any) => typeof v === 'string' && v && v !== record.id)

                return (
                  <Card
                    key={record.id}
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRecordSelect(record.id)}
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {displayValue || record.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {record.id}
                      </div>
                    </div>
                  </Card>
                )
              })
            })()}
            {(!agent?.models.find(m => m.name === selectedForm?.modelName)?.records ||
              agent?.models.find(m => m.name === selectedForm?.modelName)?.records?.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No records found. Create some records first.
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedForm?.formType === 'edit' ? 'Edit' : 'Create'} {selectedForm?.modelName}
            </DialogTitle>
            <DialogDescription>
              {selectedForm?.whenToUse || `Fill in the form to ${selectedForm?.formType === 'edit' ? 'update' : 'create'} a ${selectedForm?.modelName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedForm && agent?.models.find(m => m.name === selectedForm.modelName)?.fields
              .filter(field => selectedForm.fields.includes(field.name))
              .map((field: any) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.title || field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {isOAuthField(field) ? (
                    <button
                      type="button"
                      onClick={() => handleOAuthConnect(field)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                        isOAuthConnected(field.name)
                          ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                          : "bg-blue-50 dark:bg-blue-950/20 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                      )}
                    >
                      {isOAuthConnected(field.name) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                      )}
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm",
                          isOAuthConnected(field.name) ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"
                        )}>
                          {field.title || field.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {isOAuthConnected(field.name) ? 'Connected ✓' : `Click to connect ${(field as any).oauthProvider || 'OAuth'}`}
                        </div>
                      </div>
                    </button>
                  ) : field.type === 'textarea' || field.name.includes('description') || field.name.includes('notes') ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                      rows={4}
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      id={field.name}
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                    />
                  ) : field.type === 'boolean' ? (
                    <Select
                      value={formData[field.name]?.toString() || ''}
                      onValueChange={(value: string) => setFormData({ ...formData, [field.name]: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : field.type === 'enum' && field.enumValues ? (
                    <Select
                      value={formData[field.name] || ''}
                      onValueChange={(value: string) => setFormData({ ...formData, [field.name]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.title || field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.enumValues.map((value: string) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'date' ? (
                    <Input
                      id={field.name}
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                    />
                  )}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                selectedForm?.formType === 'edit' ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Execution Modal (shown after form submission if linked to schedule) */}
      {showScheduleExecution && executionScheduleId && agent && (
        <Dialog open={showScheduleExecution} onOpenChange={(open: boolean) => {
          setShowScheduleExecution(open)
          if (!open) {
            setScheduleExecutionComplete(false)
            setExecutionScheduleId(null)
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Execute Schedule
              </DialogTitle>
              <DialogDescription>
                Your form has been submitted successfully. Click "Execute" below to run the linked schedule and process your data.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <ScheduleExecution
                scheduleName={getScheduleName()}
                steps={getScheduleSteps()}
                onExecute={executeSchedule}
                onComplete={(success) => {
                  setScheduleExecutionComplete(success)
                  // Don't auto-close - let user close manually
                }}
                autoStart={false}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleExecution(false)
                  setExecutionScheduleId(null)
                  setScheduleExecutionComplete(false)
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

