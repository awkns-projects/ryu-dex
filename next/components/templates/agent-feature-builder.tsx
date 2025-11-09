"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shuffle, Loader2, CheckCircle2, X as XIcon, RefreshCw } from "lucide-react"
import { PILOT_EXAMPLES, getRandomExample } from "@/lib/pilot-examples"
import { useAgentUpdater } from "@/hooks/use-agent-updater"

const AVAILABLE_CONNECTIONS = [
  { id: 'google', name: 'Google', icon: '🔍', description: 'Gmail, Calendar' },
  { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Posts, Pages' },
  { id: 'instagram', name: 'Instagram', icon: '📸', description: 'Posts, Stories' },
  { id: 'threads', name: 'Threads', icon: '🧵', description: 'Posts' },
  { id: 'x', name: 'X', icon: '𝕏', description: 'Tweets, DMs' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', description: 'Videos' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', description: 'Messages' },
  { id: 'ccxt', name: 'CCXT', icon: '₿', description: 'Crypto' },
] as const

interface AgentFeatureBuilderProps {
  agentId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AgentFeatureBuilder({ agentId, onSuccess, onCancel }: AgentFeatureBuilderProps) {
  const router = useRouter()
  const { isUpdating, error: updateError, progress, updateAgent } = useAgentUpdater()

  const [featureDescription, setFeatureDescription] = useState('')
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [showSuccessView, setShowSuccessView] = useState(false)

  // Show success view when update is complete
  useEffect(() => {
    if (!isUpdating && progress === 'Complete!') {
      setShowSuccessView(true)
      // Auto-refresh after showing success for 2 seconds
      setTimeout(() => {
        router.refresh()
        if (onSuccess) {
          onSuccess()
        }
      }, 2000)
    }
  }, [isUpdating, progress, router, onSuccess])

  const toggleConnection = (connectionId: string) => {
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const loadRandomExample = () => {
    const example = getRandomExample()
    setFeatureDescription(example.description)
    setSelectedConnections(example.connections)
  }

  const loadExample = (example: typeof PILOT_EXAMPLES[0]) => {
    setFeatureDescription(example.description)
    setSelectedConnections(example.connections)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!featureDescription.trim() || featureDescription.length < 50) return

    try {
      await updateAgent({
        agentId,
        featureDescription,
        connections: selectedConnections.length > 0 ? selectedConnections : undefined,
      })
    } catch (error) {
      console.error('Error adding feature:', error)
    }
  }

  const isValid = featureDescription.trim() && featureDescription.length >= 50

  // Updating/Success View - Non-editable summary (shown during update and after success)
  if (isUpdating || showSuccessView) {
    const isComplete = showSuccessView
    return (
      <div className="w-full">
        <Card className={`p-6 lg:p-8 bg-gradient-to-br ${isComplete
          ? 'from-green-500/5 via-background to-background border-green-500/20'
          : 'from-primary/5 via-background to-background border-primary/20'
          }`}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header - Updating or Success */}
            <div className="text-center space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-500/10' : 'bg-primary/10'
                }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : (
                  <Sparkles className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {isComplete ? 'Feature Added Successfully!' : 'Adding Feature to Agent...'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {isComplete
                    ? "Your new feature has been added to the agent. Refreshing..."
                    : "Please wait while AI generates models, actions, and schedules for this feature."
                  }
                </p>
              </div>
            </div>

            {/* Feature Summary - Read-only */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Feature Summary
              </h4>

              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Feature Description</Label>
                  <p className="text-base mt-1 whitespace-pre-wrap leading-relaxed">{featureDescription}</p>
                </div>

                {selectedConnections.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Used Connections</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedConnections.map((id) => {
                        const connection = AVAILABLE_CONNECTIONS.find(c => c.id === id)
                        return (
                          <Badge key={id} className="gap-2 bg-primary/10 text-primary border-primary/20">
                            <span className="text-lg">{connection?.icon}</span>
                            <span>{connection?.name}</span>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {isUpdating && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">AI is working...</p>
                    <p className="text-sm text-muted-foreground mt-1">{progress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {updateError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-semibold text-destructive">Error</h4>
                <p className="text-sm text-muted-foreground">{updateError}</p>
              </div>
            )}

            {/* Success - Refresh indicator */}
            {isComplete && (
              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  <div>
                    <p className="font-medium text-green-600">Refreshing page...</p>
                    <p className="text-sm text-muted-foreground mt-1">Your new feature will appear in a moment</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-background to-background rounded-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Add New Feature
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Describe what you want and AI will add it to your agent
              </p>
            </div>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Update Progress */}
          {isUpdating && (
            <div className="p-4 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div>
                  <h4 className="font-semibold text-primary">Adding Feature</h4>
                  <p className="text-sm text-muted-foreground">{progress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {updateError && (
            <div className="p-4 rounded-lg bg-destructive/10">
              <h4 className="font-semibold text-destructive">Error</h4>
              <p className="text-sm text-muted-foreground">{updateError}</p>
            </div>
          )}

          {/* Examples */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Try an Example</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadRandomExample}
                className="gap-2"
              >
                <Shuffle className="w-3 h-3" />
                Random
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {PILOT_EXAMPLES.slice(0, 12).map((example) => (
                <button
                  key={example.name}
                  type="button"
                  onClick={() => loadExample(example)}
                  className="p-2 text-left rounded bg-background hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <div className="text-lg mb-1">{example.icon}</div>
                  <div className="text-xs font-medium truncate" title={example.name}>
                    {example.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">What feature do you want to add? *</Label>
              <span className="text-xs text-muted-foreground">
                {featureDescription.length}/500
              </span>
            </div>
            <Textarea
              id="description"
              placeholder={`Describe the new feature you want to add...\n\nFor example:\n- Add ability to track customer support tickets\n- Create daily summary reports of social media engagement\n- Automatically backup data to Google Drive\n- Send weekly performance analytics emails`}
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value.slice(0, 500))}
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what data you need, what should happen, and when. AI will create forms, actions, and schedules automatically.
            </p>
          </div>

          {/* Connections */}
          <div className="space-y-3">
            <Label>External Service Connections (Optional)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_CONNECTIONS.map((connection) => (
                <button
                  key={connection.id}
                  type="button"
                  onClick={() => toggleConnection(connection.id)}
                  className={`p-3 rounded-lg text-left transition-all ${selectedConnections.includes(connection.id)
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'bg-muted/50 hover:bg-muted'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{connection.icon}</span>
                    {selectedConnections.includes(connection.id) && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="text-xs font-semibold">{connection.name}</div>
                  <div className="text-[10px] text-muted-foreground">{connection.description}</div>
                </button>
              ))}
            </div>

            {selectedConnections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedConnections.map((id) => {
                  const connection = AVAILABLE_CONNECTIONS.find(c => c.id === id)
                  return (
                    <Badge key={id} className="gap-1 bg-secondary text-secondary-foreground">
                      <span>{connection?.icon}</span>
                      <span>{connection?.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleConnection(id)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6">
            <p className="text-xs text-muted-foreground max-w-md">
              AI will generate models, forms, actions, and schedules for this feature
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!isValid || isUpdating}
              className="bg-foreground text-background hover:bg-foreground/90 gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Add Feature
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

