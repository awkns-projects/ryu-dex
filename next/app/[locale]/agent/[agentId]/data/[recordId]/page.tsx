"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import {
  Loader2, ArrowLeft, Save, Trash2, Zap, Link as LinkIcon,
  FileText, AlertCircle, RefreshCw, CheckCircle2, XCircle,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  initiateAgentGoogleOAuth,
  initiateAgentFacebookOAuth,
  initiateAgentXOAuth,
  initiateAgentInstagramOAuth,
  initiateAgentThreadsOAuth,
  hasValidOAuthTokens
} from "@/lib/agent-oauth.web"

interface AgentModel {
  id: string
  name: string
  description?: string
  fields: AgentField[]
  forms?: AgentForm[]
}

interface AgentField {
  name: string
  title?: string
  type: string
  required?: boolean
  description?: string
  oauthProvider?: string
  oauthScopes?: string[]
}

interface AgentForm {
  id: string
  name: string
  formName?: string
  formType?: 'new' | 'edit'
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
  targetModel?: string
  targetModelId?: string
  requiresConnection?: string
}

interface Connection {
  id: string
  title: string
  provider: string
  fieldName: string
  scopes: string[]
  description?: string
  required?: boolean
  icon?: string
}

interface AgentData {
  id: string
  name: string
  models: AgentModel[]
  actions: AgentAction[]
  connections?: Connection[]
}

export default function DataRecordDetailPage({
  params
}: {
  params: Promise<{ agentId: string; recordId: string }>
}) {
  const { agentId, recordId } = use(params)
  const router = useRouter()

  // Data state
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [selectedModel, setSelectedModel] = useState<AgentModel | null>(null)
  const [record, setRecord] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedForm, setSelectedForm] = useState<AgentForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [showActionConfirmation, setShowActionConfirmation] = useState<{
    action: AgentAction
  } | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Action state
  const [executingAction, setExecutingAction] = useState<{
    actionName: string
  } | null>(null)

  // Load agent and record data
  const loadData = useCallback(async () => {
    if (!agentId || !recordId) {
      setError('Missing agent ID or record ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load agent data
      const agentResponse = await api.get(`/api/agent?id=${agentId}`)
      console.log('📦 Loaded agent data:', agentResponse)

      // Flatten records
      const modelsWithFlattenedRecords = agentResponse.models?.map((model: any) => ({
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
        ...agentResponse,
        models: modelsWithFlattenedRecords
      }

      setAgentData(flattenedData)

      // Find the record and its model
      let foundRecord: any = null
      let foundModel: AgentModel | null = null

      for (const model of modelsWithFlattenedRecords) {
        const rec = model.records?.find((r: any) => r.id === recordId)
        if (rec) {
          foundRecord = rec
          foundModel = model
          break
        }
      }

      if (!foundRecord || !foundModel) {
        setError('Record not found')
        setLoading(false)
        return
      }

      setRecord(foundRecord)
      setSelectedModel(foundModel)
      console.log('📋 Loaded record:', foundRecord)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [agentId, recordId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Save record
  const handleSave = async () => {
    if (!record || !selectedModel) return

    try {
      setSaving(true)

      // Extract only field values
      const fieldValues: Record<string, any> = {}
      selectedModel.fields.forEach(field => {
        if (record[field.name] !== undefined) {
          fieldValues[field.name] = record[field.name]
        }
      })

      const result = await authenticatedFetch({
        path: `/api/agent/record/${recordId}`,
        method: 'PATCH',
        body: JSON.stringify({ data: fieldValues }),
      })

      const updatedRecord = {
        ...result.record.data,
        id: result.record.id,
        modelId: result.record.modelId,
        createdAt: result.record.createdAt,
        updatedAt: result.record.updatedAt,
      }

      setRecord(updatedRecord)
      console.log('✅ Record saved successfully')
    } catch (error) {
      console.error('Failed to save record:', error)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Delete record
  const handleDelete = async () => {
    try {
      await api.delete(`/api/agent/record/${recordId}`)
      console.log('✅ Record deleted')
      router.back()
    } catch (error) {
      console.error('Failed to delete record:', error)
      setError('Failed to delete record')
    }
  }

  // Execute action
  const executeAction = async (actionId: string) => {
    if (!agentId || !selectedModel?.id || !agentData || !record) return

    const action = agentData.actions.find(a => a.id === actionId)
    if (!action) return

    setExecutingAction({ actionName: action.title || action.name })

    try {
      const result = await api.post('/api/agent/execute', {
        agentId,
        actionId,
        recordId: record.id,
        modelId: selectedModel.id,
        targetModel: action.targetModel,
      })

      // Handle OAuth requirement
      if (result.requiresOAuth) {
        setExecutingAction(null)

        const confirmed = window.confirm(
          `This action requires ${result.provider} authentication. You'll be redirected to authorize access.`
        )

        if (confirmed) {
          try {
            if (result.provider === 'google') {
              await initiateAgentGoogleOAuth(agentId, result.scopes)
            } else if (result.provider === 'facebook') {
              await initiateAgentFacebookOAuth(agentId, result.scopes)
            }

            alert('Please complete the authorization and try the action again.')
          } catch (oauthError) {
            console.error('OAuth failed:', oauthError)
            alert('Failed to initiate OAuth flow')
          }
        }
        return
      }

      if (result.updatedRecord) {
        const updatedRecord = {
          ...result.updatedRecord.data,
          id: result.updatedRecord.id,
          modelId: result.updatedRecord.modelId,
          createdAt: result.updatedRecord.createdAt,
          updatedAt: result.updatedRecord.updatedAt,
        }

        setRecord(updatedRecord)
      }

      console.log('✅ Action executed successfully')
    } catch (error) {
      console.error('Action execution failed:', error)
      setError('Failed to execute action')
    } finally {
      setTimeout(() => setExecutingAction(null), 1000)
    }
  }

  // Quick edit form submission
  const handleFormSubmit = async () => {
    if (!record) return

    try {
      const result = await authenticatedFetch({
        path: `/api/agent/record/${recordId}`,
        method: 'PATCH',
        body: JSON.stringify({ data: formData }),
      })

      const updatedRecord = {
        ...result.record.data,
        id: result.record.id,
        modelId: result.record.modelId,
        createdAt: result.record.createdAt,
        updatedAt: result.record.updatedAt,
      }

      setRecord(updatedRecord)
      setShowFormModal(false)
      setFormData({})
      console.log('✅ Form submitted successfully')
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  // Get actions for current model
  const getActionsForModel = useCallback((): AgentAction[] => {
    if (!selectedModel?.id || !agentData) return []

    return agentData.actions.filter(
      action => action.targetModel === selectedModel.name ||
        action.targetModelId === selectedModel.id
    )
  }, [selectedModel, agentData])

  // Check if field is OAuth
  const isOAuthField = (fieldName: string): boolean => {
    const field = selectedModel?.fields.find(f => f.name === fieldName)
    return !!(field as any)?.oauthProvider
  }

  // Check if OAuth is connected
  const isOAuthConnected = (fieldName: string): boolean => {
    if (!record) return false
    return hasValidOAuthTokens(record[fieldName])
  }

  // Handle OAuth button click
  const handleOAuthConnect = async (field: AgentField) => {
    if (!agentId) return

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

  // Get connection for field
  const getConnectionForField = (fieldName: string): Connection | null => {
    if (!agentData?.connections) return null
    return agentData.connections.find(conn => conn.fieldName === fieldName) || null
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error && !record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to Load Record</h3>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-2">
          <Button onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!record || !selectedModel) {
    return null
  }

  const recordName = record[selectedModel.fields[0]?.name] || 'Record'

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{recordName}</h1>
            <p className="text-muted-foreground">{selectedModel.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadData}
            disabled={loading}
            title="Refresh"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connections Section (for Workspace/Agent model only) */}
          {(selectedModel.name === 'Workspace' || selectedModel.name === 'Agent') && agentData?.connections && agentData.connections.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <LinkIcon className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-lg">Connections</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect this agent to external services
              </p>
              <div className="space-y-3">
                {agentData.connections.map((connection) => {
                  const isConnected = hasValidOAuthTokens(record[connection.fieldName])

                  return (
                    <button
                      key={connection.id}
                      onClick={async () => {
                        try {
                          if (connection.provider === 'google') {
                            await initiateAgentGoogleOAuth(agentId, connection.scopes)
                          } else if (connection.provider === 'facebook') {
                            await initiateAgentFacebookOAuth(agentId, connection.scopes)
                          } else if (connection.provider === 'x') {
                            await initiateAgentXOAuth(agentId, connection.scopes)
                          } else if (connection.provider === 'instagram') {
                            await initiateAgentInstagramOAuth(agentId, connection.scopes)
                          } else if (connection.provider === 'threads') {
                            await initiateAgentThreadsOAuth(agentId, connection.scopes)
                          } else {
                            alert(`Unsupported provider: ${connection.provider}`)
                            return
                          }
                          alert(`Opening ${connection.title}. Complete the authorization and reload this page.`)
                        } catch (error) {
                          console.error('Connection error:', error)
                          const errorMessage = error instanceof Error ? error.message : 'Failed to initiate connection'
                          alert(`OAuth Error:\n\n${errorMessage}\n\n💡 Check console for details or see OAUTH_TROUBLESHOOTING.md`)
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                        isConnected
                          ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                          : "bg-orange-50 dark:bg-orange-950/20 border-orange-500 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                      )}
                    >
                      {isConnected ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      )}
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium",
                          isConnected ? "text-green-900 dark:text-green-100" : ""
                        )}>
                          {connection.title}
                          {connection.required && <span className="text-destructive ml-1">*</span>}
                        </div>
                        {connection.description && (
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {connection.description}
                          </div>
                        )}
                        {isConnected && (
                          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                            ✓ Connected • Click to reconnect
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Quick Edit Forms - only show "edit" type forms */}
          {selectedModel.forms && selectedModel.forms.filter(form => form.formType === 'edit').length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-lg">Quick Edit Forms</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use predefined forms to edit specific fields
              </p>
              <div className="space-y-2">
                {selectedModel.forms.filter(form => form.formType === 'edit').map((form) => (
                  <Button
                    key={form.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => {
                      setSelectedForm(form)
                      const initialData: Record<string, any> = {}
                      form.fields.forEach(fieldName => {
                        if (record[fieldName] != null) {
                          initialData[fieldName] = record[fieldName]
                        }
                      })
                      setFormData(initialData)
                      setShowFormModal(true)
                    }}
                  >
                    <div className="flex items-center gap-3 text-left w-full">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">{form.name || form.formName}</div>
                        {form.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {form.description}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* All Fields */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold text-lg">All Fields</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and edit all field values directly
            </p>
            <div className="space-y-4">
              {selectedModel.fields.map((field) => {
                const isOAuth = isOAuthField(field.name)
                const isConnected = isOAuth && isOAuthConnected(field.name)

                return (
                  <div key={field.name} className="space-y-2">
                    <Label>
                      {field.title || field.name}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {isOAuth ? (
                      <button
                        onClick={() => handleOAuthConnect(field)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                          isConnected
                            ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                        )}
                      >
                        {isConnected ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <LinkIcon className="w-5 h-5 text-blue-600" />
                        )}
                        <div className="flex-1 text-left">
                          <div className={cn(
                            "font-medium text-sm",
                            isConnected ? "text-green-900 dark:text-green-100" : "text-blue-900 dark:text-blue-100"
                          )}>
                            {isConnected
                              ? `Connected to ${(field as any).oauthProvider}`
                              : `Connect ${(field as any).oauthProvider}`
                            }
                          </div>
                          {isConnected && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                              Click to reconnect or update permissions
                            </div>
                          )}
                        </div>
                        {isConnected ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (() => {
                      const value = record[field.name];
                      const isImageUrl = (field.type === 'url' || field.name.toLowerCase().includes('image') || field.name.toLowerCase().includes('url')) && 
                                        typeof value === 'string' && 
                                        (value.startsWith('data:image') || value.startsWith('http'));
                      
                      if (isImageUrl) {
                        return (
                          <div className="space-y-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={value} 
                              alt={field.title || field.name}
                              className="w-full max-w-md h-auto object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.classList.add('hidden');
                              }}
                            />
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => setRecord({ ...record, [field.name]: e.target.value })}
                              placeholder="Image URL"
                              className="text-xs"
                            />
                          </div>
                        );
                      } else if (field.type === 'textarea') {
                        return (
                          <Textarea
                            value={value != null ? String(value) : ''}
                            onChange={(e) => setRecord({ ...record, [field.name]: e.target.value })}
                            placeholder={field.description || `Enter ${field.title || field.name}`}
                            rows={4}
                          />
                        );
                      } else {
                        return (
                          <Input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={value != null ? String(value) : ''}
                            onChange={(e) => setRecord({ ...record, [field.name]: e.target.value })}
                            placeholder={field.description || `Enter ${field.title || field.name}`}
                            disabled={field.description?.includes('AI-generated')}
                          />
                        );
                      }
                    })()}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {getActionsForModel().length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Zap className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-lg">Actions</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered operations for this {selectedModel.name}
              </p>
              <div className="space-y-2">
                {getActionsForModel().map((action) => {
                  // Check connection requirements
                  const requiredConnection = action.requiresConnection && agentData?.connections
                    ? agentData.connections.find(c => c.id === action.requiresConnection)
                    : null

                  const isConnectionReady = requiredConnection
                    ? hasValidOAuthTokens(record[requiredConnection.fieldName])
                    : true

                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setShowActionConfirmation({ action })}
                      disabled={!isConnectionReady}
                    >
                      <div className="flex items-start gap-3 text-left w-full">
                        {action.emoji ? (
                          <span className="text-xl">{action.emoji}</span>
                        ) : (
                          <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{action.title || action.name}</div>
                          {action.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </div>
                          )}
                          {requiredConnection && (
                            <div className={cn(
                              "flex items-center gap-1 mt-2 text-xs",
                              isConnectionReady ? "text-green-600" : "text-orange-600"
                            )}>
                              {isConnectionReady ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {isConnectionReady
                                ? `Uses ${requiredConnection.title}`
                                : `Requires ${requiredConnection.title}`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Record Metadata */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Record Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <span className="ml-2 font-mono text-xs">{record.id}</span>
              </div>
              {record.createdAt && (
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{new Date(record.createdAt).toLocaleString()}</span>
                </div>
              )}
              {record.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="ml-2">{new Date(record.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Edit Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedForm?.name || selectedForm?.formName}
            </DialogTitle>
            <DialogDescription>
              {selectedForm?.description || `Edit ${selectedModel.name} fields`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedForm?.fields.map((fieldName) => {
              const field = selectedModel.fields.find(f => f.name === fieldName)
              if (!field) return null

              return (
                <div key={fieldName} className="space-y-2">
                  <Label>
                    {field.title || field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={formData[fieldName] || ''}
                      onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                      rows={4}
                    />
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[fieldName] || ''}
                      onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowFormModal(false)
              setFormData({})
            }}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      {showActionConfirmation && (
        <Dialog open={!!showActionConfirmation} onOpenChange={() => setShowActionConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {showActionConfirmation.action.emoji && (
                  <span className="text-3xl">{showActionConfirmation.action.emoji}</span>
                )}
                {showActionConfirmation.action.title || showActionConfirmation.action.name}
              </DialogTitle>
              <DialogDescription>
                Execute this action on <strong>{recordName}</strong>?
                {showActionConfirmation.action.description && (
                  <p className="mt-2">{showActionConfirmation.action.description}</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionConfirmation(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const { action } = showActionConfirmation
                setShowActionConfirmation(null)
                executeAction(action.id)
              }}>
                Execute Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{recordName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Overlay */}
      {executingAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="p-8 text-center space-y-4 min-w-[300px]">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">{executingAction.actionName}</h3>
              <p className="text-muted-foreground">{recordName}</p>
              <p className="text-sm text-muted-foreground mt-2">Processing...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

