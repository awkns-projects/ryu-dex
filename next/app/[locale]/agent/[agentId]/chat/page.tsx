"use client"

import { use } from "react"
import { Card } from "@/components/ui/card"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AgentChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Chat</h2>
        <p className="text-muted-foreground">Interact with your agent</p>
      </div>

      {/* Chat Container */}
      <Card className="glass-effect p-6 min-h-[500px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 space-y-4 mb-6">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
            <p className="text-muted-foreground max-w-md">
              Ask questions, get insights, or give commands to your agent
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 glass-effect rounded-2xl px-4 py-3">
            <Input
              placeholder="Type your message..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <Button
            size="icon"
            className="h-12 w-12 rounded-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button className="text-xs px-3 py-1.5 rounded-full glass-effect hover:scale-105 active:scale-95 transition-transform">
            Show recent activity
          </button>
          <button className="text-xs px-3 py-1.5 rounded-full glass-effect hover:scale-105 active:scale-95 transition-transform">
            List all workspaces
          </button>
          <button className="text-xs px-3 py-1.5 rounded-full glass-effect hover:scale-105 active:scale-95 transition-transform">
            Run an action
          </button>
        </div>
      </Card>
    </div>
  )
}

