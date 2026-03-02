"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Clock, Calendar, AlertCircle } from 'lucide-react'

type ScheduleTriggerConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

const HOURS = [
  'Midnight', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  'Noon', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
]

export function ScheduleTriggerConfig({ nodeData, onChange }: ScheduleTriggerConfigProps) {
  // Parsing initial state safely
  const [triggerInterval, setTriggerInterval] = useState(String(nodeData?.triggerInterval || 'days'))
  
  const [customSeconds, setCustomSeconds] = useState(String(nodeData?.customSeconds || '60'))
  const [customMinutes, setCustomMinutes] = useState(String(nodeData?.customMinutes || '5'))
  const [customHours, setCustomHours] = useState(String(nodeData?.customHours || '1'))
  const [daysBetween, setDaysBetween] = useState(String(nodeData?.daysBetween || '1'))
  const [triggerAtHour, setTriggerAtHour] = useState(String(nodeData?.triggerAtHour || 'Midnight'))
  const [cronExpression, setCronExpression] = useState(String(nodeData?.cronExpression || '* * * * *'))
  
  const [monthsBetween, setMonthsBetween] = useState(String(nodeData?.monthsBetween || '1'))
  const [triggerOnDay, setTriggerOnDay] = useState(String(nodeData?.triggerOnDay || '1'))
  const [executionMode, setExecutionMode] = useState(String(nodeData?.executionMode || 'auto'))

  const updateParent = useCallback((updates: Record<string, unknown> = {}) => {
    onChange?.({
      triggerInterval,
      customSeconds: Number(customSeconds),
      customMinutes: Number(customMinutes),
      customHours: Number(customHours),
      daysBetween: Number(daysBetween),
      triggerAtHour,
      cronExpression,
      monthsBetween: Number(monthsBetween),
      triggerOnDay: Number(triggerOnDay),
      executionMode,
      ...updates
    })
  }, [
    triggerInterval, customSeconds, customMinutes, customHours, 
    daysBetween, triggerAtHour, monthsBetween, triggerOnDay, executionMode, cronExpression,
    onChange
  ])

  // Sync state from props if changed externally
  useEffect(() => {
    if (nodeData?.triggerInterval) setTriggerInterval(String(nodeData.triggerInterval))
    if (nodeData?.customSeconds) setCustomSeconds(String(nodeData.customSeconds))
    if (nodeData?.customMinutes) setCustomMinutes(String(nodeData.customMinutes))
    if (nodeData?.customHours) setCustomHours(String(nodeData.customHours))
    if (nodeData?.daysBetween) setDaysBetween(String(nodeData.daysBetween))
    if (nodeData?.triggerAtHour) setTriggerAtHour(String(nodeData.triggerAtHour))
    if (nodeData?.cronExpression) setCronExpression(String(nodeData.cronExpression))
    if (nodeData?.monthsBetween) setMonthsBetween(String(nodeData.monthsBetween))
    if (nodeData?.triggerOnDay) setTriggerOnDay(String(nodeData.triggerOnDay))
    if (nodeData?.executionMode) setExecutionMode(String(nodeData.executionMode))
  }, [nodeData?.triggerInterval, nodeData?.customSeconds, nodeData?.customMinutes, nodeData?.customHours, nodeData?.daysBetween, nodeData?.triggerAtHour, nodeData?.monthsBetween, nodeData?.triggerOnDay, nodeData?.executionMode, nodeData?.cronExpression])

  useEffect(() => {
    const timer = setTimeout(() => updateParent(), 500)
    return () => clearTimeout(timer)
  }, [updateParent])

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
       {/* Header */}
       <div className="px-4 py-4 border-b border-neutral-200 bg-white backdrop-blur-sm">
        <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-base">
          <span className="p-1.5 bg-neutral-900 text-white rounded">
            <Clock className="w-4 h-4" />
          </span>
          Schedule Trigger
        </h3>
        <p className="text-xs text-neutral-500 mt-1">Run workflow at specific intervals</p>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Execution Mode */}
        <div className="space-y-3">
           <Label className="text-neutral-900 font-semibold">Execution Mode</Label>
           <div className="flex flex-col gap-2">
             <div 
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${nodeData?.executionMode === 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-100 bg-neutral-50 hover:border-neutral-200'}`} 
              onClick={() => onChange?.({ ...nodeData, executionMode: 'manual' })}
             >
                <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${nodeData?.executionMode === 'manual' ? 'border-blue-500' : 'border-neutral-300'}`}>
                      {nodeData?.executionMode === 'manual' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                   </div>
                   <span className="text-sm font-bold text-neutral-900">Manual Trigger</span>
                </div>
                <p className="text-[10px] text-neutral-500 pl-6 mt-1">Executes only when you click the &apos;Run&apos; button</p>
             </div>
             
             <div 
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${nodeData?.executionMode !== 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-100 bg-neutral-50 hover:border-neutral-200'}`} 
              onClick={() => onChange?.({ ...nodeData, executionMode: 'auto' })}
             >
                <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${nodeData?.executionMode !== 'manual' ? 'border-blue-500' : 'border-neutral-300'}`}>
                      {nodeData?.executionMode !== 'manual' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                   </div>
                   <span className="text-sm font-bold text-neutral-900">Scheduler</span>
                </div>
                <p className="text-[10px] text-neutral-500 pl-6 mt-1">Automatically triggers workflow based on selected interval</p>
             </div>
           </div>
        </div>

        {/* Interval Selection */}
        <div className="space-y-3">
          <Label className="text-neutral-900 font-semibold">Trigger Interval</Label>
          <Select value={triggerInterval} onValueChange={setTriggerInterval}>
            <SelectTrigger className="border-neutral-200  text-neutral-900 dark:text-neutral-200 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-neutral-200 text-slate-900 shadow-xl overflow-hidden rounded-xl">
              <SelectItem value="seconds" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Seconds</SelectItem>
              <SelectItem value="minutes" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Minutes</SelectItem>
              <SelectItem value="hours" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Hours</SelectItem>
              <SelectItem value="days" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Days</SelectItem>
              <SelectItem value="weeks" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Weeks</SelectItem>
              <SelectItem value="months" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Months</SelectItem>
              <SelectItem value="custom" className="focus:bg-slate-100 cursor-pointer py-2 px-3">Custom (Cron)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 rounded-xl bg-white border border-white space-y-4 shadow-sm">
           {/* Dynamic Fields based on Interval */}
           
           {triggerInterval === 'seconds' && (
             <div className="space-y-2">
               <Label className="text-xs uppercase tracking-wider text-neutral-500">Every X Seconds</Label>
               <Input 
                 type="number" 
                 min="1" 
                 value={customSeconds}
                 onChange={e => setCustomSeconds(e.target.value)}
                 className="bg-white border-neutral-200  focus:ring-black dark:focus:ring-white" 
               />
               <p className="text-[10px] text-neutral-400">Interval for high-frequency tasks</p>
             </div>
           )}

           {triggerInterval === 'minutes' && (
             <div className="space-y-2">
               <Label className="text-xs uppercase tracking-wider text-neutral-500">Every X Minutes</Label>
               <Input 
                 type="number" 
                 min="1" 
                 value={customMinutes}
                 onChange={e => setCustomMinutes(e.target.value)}
                 className="bg-white border-neutral-200"
               />
             </div>
           )}

           {triggerInterval === 'hours' && (
             <div className="space-y-2">
               <Label className="text-xs uppercase tracking-wider text-neutral-500">Every X Hours</Label>
               <Input 
                 type="number" 
                 min="1" 
                 value={customHours}
                 onChange={e => setCustomHours(e.target.value)}
                 className="bg-white border-neutral-200"
               />
             </div>
           )}

           {triggerInterval === 'days' && (
             <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-neutral-500">Days Between</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={daysBetween}
                    onChange={e => setDaysBetween(e.target.value)}
                    className="bg-white border-neutral-200"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-neutral-500">At Time</Label>
                  <Select value={triggerAtHour} onValueChange={setTriggerAtHour}>
                    <SelectTrigger className="border-neutral-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-200 text-slate-900 shadow-xl overflow-hidden rounded-xl h-64">
                       {HOURS.map(h => (
                         <SelectItem key={h} value={h} className="text-xs focus:bg-slate-100 cursor-pointer">{h}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
               </div>
             </div>
           )}

           {triggerInterval === 'months' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-wider text-neutral-500">Every X Months</Label>
                       <Input 
                        type="number" 
                        value={monthsBetween}
                        onChange={e => setMonthsBetween(e.target.value)}
                        className="bg-white border-neutral-200"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-wider text-neutral-500">On Day</Label>
                       <Input 
                        type="number" 
                        min="1" max="31"
                        value={triggerOnDay}
                        onChange={e => setTriggerOnDay(e.target.value)}
                        className="bg-white border-neutral-200"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-neutral-500">At Time</Label>
                    <Select value={triggerAtHour} onValueChange={setTriggerAtHour}>
                      <SelectTrigger className="border-neutral-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-neutral-200 text-slate-900 shadow-xl overflow-hidden rounded-xl h-64">
                          {HOURS.map(h => (
                            <SelectItem key={h} value={h} className="text-xs focus:bg-slate-100 cursor-pointer">{h}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                 </div>
              </div>
           )}

           {triggerInterval === 'custom' && (
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label className="text-xs uppercase tracking-wider text-neutral-500">Cron Expression</Label>
                 <Input 
                   type="text" 
                   value={cronExpression}
                   placeholder="* * * * *"
                   onChange={e => setCronExpression(e.target.value)}
                   className="bg-white border-neutral-200 font-mono text-sm" 
                 />
                 <p className="text-[10px] text-neutral-400">
                   Format: Minute Hour Day Month DayOfWeek (e.g., "*/5 * * * *" for every 5 mins)
                 </p>
               </div>
               
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                  <div className="text-xs text-blue-700">
                     <strong>Tip:</strong> You can use standard cron syntax to create complex schedules not covered by the basic intervals.
                  </div>
               </div>
             </div>
           )}

        </div>

        <div className="pt-4 border-t border-neutral-200">
           <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                 Schedule: {triggerInterval === 'seconds' && `Every ${customSeconds} seconds`}
                 {triggerInterval === 'minutes' && `Every ${customMinutes} minutes`}
                 {triggerInterval === 'hours' && `Every ${customHours} hours`}
                 {triggerInterval === 'days' && `Every ${daysBetween} days at ${triggerAtHour}`}
                 {triggerInterval === 'months' && `Every ${monthsBetween} months on day ${triggerOnDay}`}
                 {triggerInterval === 'custom' && `Cron: ${cronExpression}`}
              </span>
           </div>
        </div>

      </div>
    </div>
  )
}
