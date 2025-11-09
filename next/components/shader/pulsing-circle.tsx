"use client"

import { useState, useRef, useEffect } from "react"
import { PulsingBorder } from "@paper-design/shaders-react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Sparkles } from "lucide-react"

export default function PulsingCircle() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Welcome to **Ryu** - The first AI trading position marketplace on Hyperliquid L1!\n\nI can help you understand:\n\n🤖 **Build AI Agents** - Create trading strategies by prompt\n💰 **Agent Marketplace** - List & sell your agents for passive income\n📊 **Continuation Trading** - Trade positions as assets with AI reasoning\n\nWhat would you like to know?"
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    // Simulate AI response with contextual answers about Ryu
    setTimeout(() => {
      let response = ""
      const lowerInput = userMessage.toLowerCase()

      if (lowerInput.includes("agent") || lowerInput.includes("build") || lowerInput.includes("create")) {
        response = "🤖 **AI Agent Builder**\n\nCreate trading strategies using natural language! Just describe what you want:\n\n• AI generates complete entry/exit logic\n• Deploys directly on Hyperliquid perps\n• Full transparency with AI reasoning\n• No coding required\n\nReady to build your first agent?"
      } else if (lowerInput.includes("marketplace") || lowerInput.includes("sell") || lowerInput.includes("earn")) {
        response = "💰 **Agent Marketplace**\n\nMonetize your trading strategies:\n\n• List agents for subscription revenue\n• Earn 5% royalties on continuation trades\n• Build reputation through performance\n• Create passive income streams\n\nYour trading logic becomes a business!"
      } else if (lowerInput.includes("position") || lowerInput.includes("trade") || lowerInput.includes("continuation")) {
        response = "📊 **Continuation Trading**\n\nThe game-changer! Positions don't die - they evolve:\n\n• Buy leveraged positions at 10-20% discounts\n• Inherit original leverage intact\n• Access full AI reasoning & strategy\n• Positions become tradable assets\n\nStop-loss ≠ game over. It's just the beginning!"
      } else if (lowerInput.includes("start") || lowerInput.includes("begin") || lowerInput.includes("how")) {
        response = "🚀 **Getting Started**\n\n1. Connect your wallet\n2. Explore the marketplace\n3. Try building an AI agent\n4. Or browse existing positions to continue\n\nWant me to guide you through any specific feature?"
      } else {
        response = "I'm here to help you understand Ryu! You can ask me about:\n\n• Building AI trading agents\n• Listing agents on marketplace\n• Trading continuation positions\n• How everything works\n\nWhat interests you most?"
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessage = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, i) => {
      // Bold text - lighter for dark mode
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium">$1</strong>')
      // Bullet points
      if (line.trim().startsWith('•')) {
        return (
          <div key={i} className="ml-1 mb-0.5 text-[13px]" dangerouslySetInnerHTML={{ __html: line }} />
        )
      }
      return (
        <div key={i} className={line.trim() ? "mb-1.5" : "mb-0.5"} dangerouslySetInnerHTML={{ __html: line || '<br/>' }} />
      )
    })
  }

  return (
    <>
      {/* Pulsing Circle Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-30 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Pulsing Border Circle */}
          <PulsingBorder
            colors={["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]}
            speed={1.5}
            roundness={1}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
            }}
          />

          {/* Rotating Text Around the Pulsing Border */}
          <motion.svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transform: "scale(1.6)" }}
          >
            <defs>
              <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="text-sm fill-white/80 instrument">
              <textPath href="#circle" startOffset="0%">
                ryu is amazing • ryu is amazing • ryu is amazing • ryu is amazing •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </motion.div>

      {/* Mini Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed bottom-32 right-8 z-40 w-[380px] h-[480px] backdrop-blur-xl bg-black/70 border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Glass shine effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Ryu Assistant</h3>
                  <p className="text-white/50 text-[11px] font-light">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 h-[calc(100%-130px)] scrollbar-hide">
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${message.role === "user"
                      ? "bg-white text-black shadow-sm"
                      : "bg-white/10 text-white/90 border border-white/20"
                      }`}
                  >
                    <div className="text-[13px] font-light leading-relaxed">
                      {renderMessage(message.content)}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl px-3.5 py-2.5 border border-white/20">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-black/50 backdrop-blur-xl border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Ryu..."
                  className="w-full bg-white/10 border border-white/20 rounded-full pl-4 pr-11 py-2.5 text-white text-[13px] font-light placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/[0.15] transition-all duration-200"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed text-black rounded-full flex items-center justify-center transition-all duration-200 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

