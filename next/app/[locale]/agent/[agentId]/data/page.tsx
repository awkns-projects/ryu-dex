"use client"

import { use, useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import {
  Database, Plus, Loader2, Search, LayoutGrid, LayoutList,
  MoreVertical, Edit, Copy, Trash2, ChevronDown, AlertCircle,
  RefreshCw, Zap, Link as LinkIcon, FileText, CheckCircle2,
  XCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api, authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { hasValidOAuthTokens } from "@/lib/agent-oauth.web"

type ViewMode = 'table' | 'card'

interface AgentModel {
  id: string
  name: string
  description?: string
  fields: AgentField[]
  records?: any[]
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
}

interface AgentData {
  id: string
  name: string
  models: AgentModel[]
  actions: AgentAction[]
  connections?: Connection[]
}

export default function AgentDataPage({ params }: { params: Promise<{ agentId: string; locale: string }> }) {
  const { agentId, locale } = use(params)
  const router = useRouter()

  // Agent data state
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [selectedModel, setSelectedModel] = useState<AgentModel | null>(null)
  const [currentData, setCurrentData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [showFormSelector, setShowFormSelector] = useState(false)
  const [showActionConfirmation, setShowActionConfirmation] = useState<{
    action: AgentAction
    recordId: string
    recordName: string
  } | null>(null)

  // Form state
  const [selectedForm, setSelectedForm] = useState<AgentForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Action state
  const [executingAction, setExecutingAction] = useState<{
    actionName: string
    recordName: string
  } | null>(null)

  // Load agent data
  const loadAgentData = useCallback(async () => {
    if (!agentId) {
      setError('No agent ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await api.get(`/api/agent?id=${agentId}`)
      console.log('📦 Loaded agent data:', data)

      // Flatten records
      const modelsWithFlattenedRecords = data.models?.map((model: any) => ({
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
        ...data,
        models: modelsWithFlattenedRecords
      }

      setAgentData(flattenedData)

      // Select first model by default
      if (modelsWithFlattenedRecords.length > 0) {
        const firstModel = modelsWithFlattenedRecords[0]
        setSelectedModel(firstModel)
        setCurrentData(firstModel.records || [])
      }
    } catch (err) {
      console.error('Failed to load agent:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    loadAgentData()
  }, [loadAgentData])

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return currentData

    const query = searchQuery.toLowerCase()
    return currentData.filter(row =>
      Object.values(row).some(value => {
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [searchQuery, currentData])

  // CRUD operations
  const handleCreateRecord = async (data: Record<string, any>) => {
    if (!agentId || !selectedModel?.id || !agentData) return

    try {
      const result = await api.post('/api/agent/record', {
        agentId,
        modelId: selectedModel.id,
        data,
      })

      const newRecord = {
        ...result.record.data,
        id: result.record.id,
        modelId: result.record.modelId,
        createdAt: result.record.createdAt,
        updatedAt: result.record.updatedAt,
      }

      setCurrentData(prev => [...prev, newRecord])
      setShowFormModal(false)
      setFormData({})
      console.log('✅ Record created successfully')
    } catch (error) {
      console.error('Failed to create record:', error)
    }
  }

  const handleUpdateRecord = async (recordId: string, updates: Record<string, any>) => {
    if (!agentId || !selectedModel?.id) return

    try {
      const result = await authenticatedFetch({
        path: `/api/agent/record/${recordId}`,
        method: 'PATCH',
        body: JSON.stringify({ data: updates }),
      })

      const updatedRecord = {
        ...result.record.data,
        id: result.record.id,
        modelId: result.record.modelId,
        createdAt: result.record.createdAt,
        updatedAt: result.record.updatedAt,
      }

      setCurrentData(prev =>
        prev.map(r => (r.id === recordId ? updatedRecord : r))
      )

      console.log('✅ Record updated successfully')
    } catch (error) {
      console.error('Failed to update record:', error)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!agentId || !selectedModel?.id) return

    try {
      await api.delete(`/api/agent/record/${recordId}`)
      setCurrentData(prev => prev.filter(r => r.id !== recordId))
      console.log('✅ Record deleted successfully')
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  const handleBatchDelete = async () => {
    const recordIds = Array.from(selectedRows).filter(id => id != null && id !== '')
    if (recordIds.length === 0) return

    try {
      await authenticatedFetch({
        path: '/api/agent/record/batch',
        method: 'DELETE',
        body: JSON.stringify({ recordIds }),
      })

      setCurrentData(prev => prev.filter(record => !recordIds.includes(record.id)))
      setSelectedRows(new Set())
      console.log('✅ Batch delete successful')
    } catch (error) {
      console.error('Failed to batch delete:', error)
    }
  }

  // Execute action
  const executeAction = async (actionId: string, recordId: string, recordName: string) => {
    if (!agentId || !selectedModel?.id || !agentData) return

    const action = agentData.actions.find(a => a.id === actionId)
    if (!action) return

    setExecutingAction({ actionName: action.title || action.name, recordName })

    try {
      const result = await api.post('/api/agent/execute', {
        agentId,
        actionId,
        recordId,
        modelId: selectedModel.id,
        targetModel: action.targetModel,
      })

      if (result.updatedRecord) {
        const updatedRecord = {
          ...result.updatedRecord.data,
          id: result.updatedRecord.id,
          modelId: result.updatedRecord.modelId,
          createdAt: result.updatedRecord.createdAt,
          updatedAt: result.updatedRecord.updatedAt,
        }

        setCurrentData(prev =>
          prev.map(r => (r.id === recordId ? updatedRecord : r))
        )
      }

      console.log('✅ Action executed successfully')
    } catch (error) {
      console.error('Action execution failed:', error)
    } finally {
      setTimeout(() => setExecutingAction(null), 1000)
    }
  }

  // UI Handlers
  const handleNewClick = () => {
    if (!selectedModel) return

    // Filter to only show "new" type forms
    const newForms = (selectedModel.forms || []).filter(form =>
      !form.formType || form.formType === 'new'
    )

    if (newForms.length > 1) {
      setShowFormSelector(true)
    } else if (newForms.length === 1) {
      setSelectedForm(newForms[0])
      setShowFormModal(true)
      setFormData({})
    } else {
      setSelectedForm(null)
      setShowFormModal(true)
      setFormData({})
    }
  }

  const handleRowClick = (record: any) => {
    // Navigate to detail page instead of opening modal
    router.push(`/${locale}/agent/${agentId}/data/${record.id}`)
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedRows(new Set(filteredData.map(row => row.id)))
  }

  const deselectAll = () => {
    setSelectedRows(new Set())
  }

  // Get actions for current model
  const getActionsForModel = useCallback((modelId?: string): AgentAction[] => {
    if (!modelId || !agentData) return []

    const model = agentData.models.find(m => m.id === modelId)
    if (!model) return []

    return agentData.actions.filter(
      action => action.targetModel === model.name || action.targetModelId === model.id
    )
  }, [agentData])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h3 className="text-lg font-semibold">Failed to Load Data</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadAgentData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Data Management</h2>
          <p className="text-muted-foreground">
            {selectedModel
              ? `${selectedModel.fields.length} fields • ${currentData.length} records`
              : 'Select a model to view records'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          {/* New Record Button - only show if there are "new" type forms */}
          {selectedModel && (selectedModel.forms || []).some(form => !form.formType || form.formType === 'new') && (
            <Button onClick={handleNewClick}>
              <Plus className="w-4 h-4" />
              New Record
            </Button>
          )}
        </div>
      </div>

      {/* Model Selector & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Model Picker */}
        <DropdownMenu open={showModelPicker} onOpenChange={setShowModelPicker}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[200px]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>{selectedModel?.name || 'Select Model'}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[300px]">
            {agentData?.models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => {
                  setSelectedModel(model)
                  setCurrentData(model.records || [])
                  setSearchQuery('')
                  setShowModelPicker(false)
                }}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.fields.length} fields • {model.records?.length || 0} records
                  </span>
                </div>
                {selectedModel?.id === model.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search in ${filteredData.length} records...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Selection Actions */}
      {selectedRows.size > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedRows.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Data Display */}
      {selectedModel && (
        <>
          {viewMode === 'table' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                          onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                          className="rounded border-input"
                        />
                      </th>
                      {selectedModel.fields.map((field) => (
                        <th key={field.name} className="px-4 py-3 text-left text-sm font-medium">
                          {field.title || field.name}
                        </th>
                      ))}
                      <th className="w-12 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedRows.has(row.id) && "bg-primary/5"
                        )}
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                            className="rounded border-input"
                          />
                        </td>
                        {selectedModel.fields.map((field) => {
                          const value = row[field.name];
                          const isImageUrl = field.name.toLowerCase().includes('image') || 
                                            field.name.toLowerCase().includes('url') && 
                                            typeof value === 'string' && 
                                            (value.startsWith('data:image') || value.startsWith('http'));
                          
                          return (
                            <td key={field.name} className="px-4 py-3 text-sm">
                              {value != null ? (
                                isImageUrl ? (
                                  <div className="flex items-center gap-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                      src={value} 
                                      alt={field.name}
                                      className="w-16 h-16 object-cover rounded border"
                                      onError={(e) => {
                                        // If image fails to load, show text instead
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.nextSibling) {
                                          (target.nextSibling as HTMLElement).style.display = 'block';
                                        }
                                      }}
                                    />
                                    <span className="text-xs text-muted-foreground hidden">
                                      {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                                    </span>
                                  </div>
                                ) : (
                                  String(value)
                                )
                              ) : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRowClick(row)}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteRecord(row.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No records found</p>
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((row) => (
                <Card
                  key={row.id}
                  className={cn(
                    "p-4 cursor-pointer hover:shadow-md transition-all",
                    selectedRows.has(row.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => handleRowClick(row)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {row[selectedModel.fields[0]?.name] || 'Record'}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRowClick(row)}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRecord(row.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    {selectedModel.fields.slice(1, 4).map((field) => {
                      const value = row[field.name];
                      const isImageUrl = (field.type === 'url' || field.name.toLowerCase().includes('image') || field.name.toLowerCase().includes('url')) && 
                                        typeof value === 'string' && 
                                        (value.startsWith('data:image') || value.startsWith('http'));
                      
                      return (
                        <div key={field.name} className="text-sm">
                          <span className="text-muted-foreground">{field.title || field.name}: </span>
                          {value != null ? (
                            isImageUrl ? (
                              <div className="mt-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={value} 
                                  alt={field.name}
                                  className="w-full max-w-xs h-auto object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <span>{String(value)}</span>
                            )
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}

              {filteredData.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No records found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Form Selector Modal */}
      <Dialog open={showFormSelector} onOpenChange={setShowFormSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Form</DialogTitle>
            <DialogDescription>
              Select which form you'd like to use to create a new record
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {selectedModel?.forms?.filter(form => !form.formType || form.formType === 'new').map((form) => (
              <Button
                key={form.id}
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => {
                  setSelectedForm(form)
                  setShowFormSelector(false)
                  setShowFormModal(true)
                  setFormData({})
                }}
              >
                <div className="flex items-center gap-3 text-left">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{form.name || form.formName}</div>
                    {form.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {form.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {form.fields.length} fields
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Record</DialogTitle>
            <DialogDescription>
              {selectedForm
                ? selectedForm.description || `Fill in the ${selectedForm.name} form`
                : `Enter values for ${selectedModel?.name}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedModel && (() => {
              const fieldsToShow = selectedForm?.fields
                ? selectedModel.fields.filter(f => selectedForm.fields.includes(f.name))
                : selectedModel.fields.filter(f => !f.description?.includes('AI-generated'))

              return fieldsToShow.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.title || field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.description || `Enter ${field.title || field.name}`}
                    />
                  )}
                </div>
              ))
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowFormModal(false)
              setFormData({})
            }}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateRecord(formData)}>
              Create
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
                Execute this action on <strong>{showActionConfirmation.recordName}</strong>?
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
                const { action, recordId, recordName } = showActionConfirmation
                setShowActionConfirmation(null)
                executeAction(action.id, recordId, recordName)
              }}>
                Execute Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Execution Overlay */}
      {executingAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="p-8 text-center space-y-4 min-w-[300px]">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">{executingAction.actionName}</h3>
              <p className="text-muted-foreground">{executingAction.recordName}</p>
              <p className="text-sm text-muted-foreground mt-2">Processing...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

