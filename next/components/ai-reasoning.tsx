"use client"

export function AIReasoning() {
  return (
    <section className="py-32 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-balance">Commands, Not Formulas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Submit natural language commands through forms. AI executes them and stores its reasoning in cells for you
            to review.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Command Input */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground">COMMAND INPUT</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm font-medium mb-2">What would you like to do?</p>
                  <div className="p-3 rounded bg-background border border-border font-mono text-sm">
                    Calculate total revenue from Shopify orders this week
                  </div>
                </div>
                <button className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  Execute Command
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground">RECENT COMMANDS</h3>
              <div className="space-y-3">
                {[
                  { cmd: "Summarize Instagram engagement", status: "completed" },
                  { cmd: "Update inventory from Shopify", status: "running" },
                  { cmd: "Generate weekly sales report", status: "completed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div
                      className={`h-2 w-2 rounded-full ${item.status === "running" ? "bg-primary animate-pulse" : "bg-green-500"}`}
                    />
                    <span className="text-sm flex-1">{item.cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Reasoning Output */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground">AI REASONING IN CELLS</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Reasoning:</p>
                    <p className="text-sm">Fetched 47 orders from Shopify API (Oct 14-20)</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Reasoning:</p>
                    <p className="text-sm">Filtered completed orders, excluded refunds</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Reasoning:</p>
                    <p className="text-sm">Calculated sum: $12,847.50</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Result:</p>
                    <p className="text-lg font-bold">$12,847.50</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Transparent AI:</span> Every calculation shows its work.
                Click any cell to see how the AI arrived at that answer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
