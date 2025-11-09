export function DataTrust() {
  const features = [
    {
      title: "Encrypted",
      description: "End-to-end encryption for all your data",
    },
    {
      title: "GDPR Compliant",
      description: "Full compliance with data protection regulations",
    },
    {
      title: "OAuth Verified",
      description: "Secure, revocable API connections",
    },
  ]

  return (
    <section className="py-32 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-balance">Your Data, Your Control</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your data stays yours. We only access the APIs you connect, and you can disconnect anytime. No data resale.
            No hidden training.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
                <svg className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
