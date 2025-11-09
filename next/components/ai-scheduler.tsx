"use client"

import { useTranslations } from 'next-intl'

export function AIScheduler() {
  const t = useTranslations('aiScheduler')
  
  const schedules = [
    { time: "06:00", task: t('schedules.task1'), status: "completed", duration: "2m" },
    { time: "09:00", task: t('schedules.task2'), status: "completed", duration: "5m" },
    { time: "12:00", task: t('schedules.task3'), status: "running", duration: "3m" },
    { time: "15:00", task: t('schedules.task4'), status: "scheduled", duration: "4m" },
    { time: "18:00", task: t('schedules.task5'), status: "scheduled", duration: "2m" },
  ]

  const weekDays = [
    t('weekDays.mon'),
    t('weekDays.tue'),
    t('weekDays.wed'),
    t('weekDays.thu'),
    t('weekDays.fri'),
    t('weekDays.sat'),
    t('weekDays.sun')
  ]
  const currentDay = 0 // Monday

  return (
    <section className="py-32 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">{t('title')}</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Calendar View */}
          <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
            <div className="border-b border-border px-4 py-3 bg-muted/30">
              <h3 className="text-sm font-semibold">{t('monthYear')}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 6 + 1
                  const isCurrentDay = i === currentDay + 6
                  const hasTask = dayNum > 0 && dayNum <= 31
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-sm rounded-md transition-all ${isCurrentDay
                          ? "bg-foreground text-background font-semibold shadow-md"
                          : hasTask
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "text-muted-foreground/30"
                        }`}
                    >
                      {dayNum > 0 && dayNum <= 31 ? dayNum : ""}
                      {hasTask && !isCurrentDay && dayNum % 3 === 0 && (
                        <div className="absolute w-1 h-1 rounded-full bg-primary mt-6" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t('todaysSchedule')}</h3>
                <div className="text-sm text-muted-foreground">{t('mondayDate')}</div>
              </div>
            </div>

            <div className="p-6 space-y-2">
              {schedules.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-all group"
                >
                  <div className="flex-shrink-0 w-16 text-sm font-mono text-muted-foreground">{item.time}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-0.5">{item.task}</div>
                    <div className="text-xs text-muted-foreground">{t('duration')}: {item.duration}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "completed" && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground font-medium">{t('status.done')}</span>
                      </>
                    )}
                    {item.status === "running" && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgb(var(--primary))]" />
                        <span className="text-xs text-muted-foreground font-medium">{t('status.running')}</span>
                      </>
                    )}
                    {item.status === "scheduled" && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground font-medium">{t('status.scheduled')}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4 bg-muted/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('totalTasks')}</span>
                <span className="font-semibold">{schedules.length} {t('automatedWorkflows')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
