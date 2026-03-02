"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type CalendarConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function CalendarConfig({ nodeId, nodeData, onChange }: CalendarConfigProps) {
  const [calendar, setCalendar] = useState(String(nodeData?.calendar || ''))
  const [eventTitle, setEventTitle] = useState(String(nodeData?.eventTitle || ''))
  const [startTime, setStartTime] = useState(String(nodeData?.startTime || ''))
  const [endTime, setEndTime] = useState(String(nodeData?.endTime || ''))
  const [attendees, setAttendees] = useState(String(nodeData?.attendees || ''))
  const [description, setDescription] = useState(String(nodeData?.description || ''))
  const [reminder, setReminder] = useState(String(nodeData?.reminder || '15'))
  const [action, setAction] = useState(String(nodeData?.action || 'create'))

  const handleChange = useCallback(() => {
    onChange?.({
      calendar,
      eventTitle,
      startTime,
      endTime,
      attendees,
      description,
      reminder,
      action,
    })
  }, [calendar, eventTitle, startTime, endTime, attendees, description, reminder, action, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Calendar Configuration</h3>

      <div>
        <Label htmlFor="calendar">Calendar</Label>
        <Input
          id="calendar"
          placeholder="Calendar name"
          value={calendar}
          onChange={(e) => setCalendar(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="eventTitle">Event Title</Label>
        <Input
          id="eventTitle"
          placeholder="Meeting title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="attendees">Attendees</Label>
        <Input
          id="attendees"
          placeholder="email@example.com, email2@example.com"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Event description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="reminder">Reminder (minutes before)</Label>
        <Input
          id="reminder"
          type="number"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="action">Action</Label>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="get">Get</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
