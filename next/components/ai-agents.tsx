"use client"

export function AIAgents() {
  return (
    <section className="py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-balance">Intelligence Behind Every Sheet</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every sheet comes with AI agents built in — they fetch data, clean records, and trigger updates on
              schedule. They work quietly in the background so you can focus on decisions, not details.
            </p>
            <div className="space-y-3 pt-4">
              <p className="text-muted-foreground">You can even create new agents with a simple command:</p>
              <div className="space-y-2 pl-4 border-l-2 border-primary">
                <p className="font-mono text-sm text-foreground">"Summarize last week's sales"</p>
                <p className="font-mono text-sm text-foreground">"Track my daily engagement"</p>
                <p className="font-mono text-sm text-foreground">"Alert me when revenue hits $10k"</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 blur-3xl" />
            <div className="relative rounded-lg border border-border bg-card p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-mono">Fetching Shopify orders...</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <span className="text-sm font-mono">Calculating revenue trends...</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "1s" }} />
                  <span className="text-sm font-mono">Generating weekly summary...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
