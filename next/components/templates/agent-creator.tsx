"use client"

import React, { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Shuffle, Loader2, CheckCircle2, X as XIcon, ArrowRight } from "lucide-react"
import { PILOT_EXAMPLES, getRandomExample } from "@/lib/pilot-examples"
import { useAgentCreator } from "@/hooks/use-agent-creator"

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

export function AgentCreator() {
  const t = useTranslations('pilot')
  const locale = useLocale()
  const router = useRouter()
  const { isCreating, error: creationError, progress, createAgent, agentId } = useAgentCreator()

  const [isExpanded, setIsExpanded] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [showSuccessView, setShowSuccessView] = useState(false)

  // Show success view when agent is created
  useEffect(() => {
    if (agentId && !isCreating) {
      setShowSuccessView(true)
    }
  }, [agentId, isCreating])

  const toggleConnection = (connectionId: string) => {
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const loadRandomExample = () => {
    const example = getRandomExample()
    setAgentName(example.name)
    setAgentDescription(example.description)
    setSelectedConnections(example.connections)
    if (!isExpanded) setIsExpanded(true)
  }

  const loadExample = (example: typeof PILOT_EXAMPLES[0]) => {
    setAgentName(example.name)
    setAgentDescription(example.description)
    setSelectedConnections(example.connections)
    if (!isExpanded) setIsExpanded(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName.trim() || !agentDescription.trim() || agentDescription.length < 50) return

    try {
      await createAgent({
        agentName,
        agentDescription,
        connections: selectedConnections.length > 0 ? selectedConnections : undefined,
      })
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  const isValid = agentName.trim() && agentDescription.trim() && agentDescription.length >= 50

  // Creating/Success View - Non-editable summary (shown during creation and after success)
  if (isCreating || (showSuccessView && agentId)) {
    const isComplete = showSuccessView && agentId
    return (
      <div className="w-full">
        <Card className={`p-6 lg:p-8 bg-gradient-to-br ${isComplete
          ? 'from-green-500/5 via-background to-background border-green-500/20'
          : 'from-primary/5 via-background to-background border-primary/20'
          }`}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header - Creating or Success */}
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
                  {isComplete ? 'Agent Created Successfully!' : 'Creating Your Agent...'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {isComplete
                    ? "Your AI agent has been created and configured. You'll be redirected shortly."
                    : "Please wait while AI generates your agent's features, models, and actions."
                  }
                </p>
              </div>
            </div>

            {/* Agent Summary - Read-only */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Agent Summary
              </h4>

              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Agent Name</Label>
                  <p className="text-base font-medium mt-1">{agentName}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="text-base mt-1 whitespace-pre-wrap leading-relaxed">{agentDescription}</p>
                </div>

                {selectedConnections.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Connected Services</Label>
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
            {isCreating && (
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
            {creationError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-semibold text-destructive">Error</h4>
                <p className="text-sm text-muted-foreground">{creationError}</p>
              </div>
            )}

            {/* Success - Redirect indicator */}
            {isComplete && (
              <>
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                    <div>
                      <p className="font-medium text-green-600">Redirecting to your agent...</p>
                      <p className="text-sm text-muted-foreground mt-1">You'll be automatically redirected to configure your new agent</p>
                    </div>
                  </div>
                </div>

                {/* Manual navigation button */}
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => router.push(`/${locale}/agent/${agentId}`)}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Go to Agent Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!isExpanded ? (
        // Collapsed State - Call to Action
        <div className="p-8 bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-lg">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Custom Agent Builder</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Build Your Own Custom Agent
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't see what you need? Describe your ideal automation in plain English and let AI build it for you in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setIsExpanded(true)}
                className="bg-foreground text-background hover:bg-foreground/90 gap-2 text-base px-8"
              >
                <Sparkles className="w-5 h-5" />
                Start Building
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={loadRandomExample}
                className="gap-2 text-base"
              >
                <Shuffle className="w-5 h-5" />
                Try Random Example
              </Button>
            </div>

            <div className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">Quick Start Examples:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PILOT_EXAMPLES.slice(0, 6).map((example) => (
                  <button
                    key={example.name}
                    onClick={() => loadExample(example)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <span className="mr-1.5">{example.icon}</span>
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Expanded State - Builder Form
        <div className="p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-background to-background rounded-lg">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Build Custom Agent
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe what you want and AI will create everything
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            </div>

            {/* Creation Progress */}
            {isCreating && (
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div>
                    <h4 className="font-semibold text-primary">Creating Your Agent</h4>
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {creationError && (
              <div className="p-4 rounded-lg bg-destructive/10">
                <h4 className="font-semibold text-destructive">Error</h4>
                <p className="text-sm text-muted-foreground">{creationError}</p>
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

            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                placeholder="Social Media Manager"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </div>

            {/* Agent Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">What should this agent do? *</Label>
                <span className="text-xs text-muted-foreground">
                  {agentDescription.length}/500
                </span>
              </div>
              <Textarea
                id="description"
                placeholder={`Describe everything your agent should do...\n\nFor example:\n- Automatically generate engaging social media posts\n- Post daily to X and Instagram\n- Track engagement metrics\n- Send weekly performance reports`}
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value.slice(0, 500))}
                rows={6}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about data, processing, and automation. AI will imagine all features.
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
                AI will generate features, forms, actions, and schedules automatically
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={!isValid || isCreating}
                className="bg-foreground text-background hover:bg-foreground/90 gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

