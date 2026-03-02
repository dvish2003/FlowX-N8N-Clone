"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type NotionConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function NotionConfig({ nodeId, nodeData, onChange }: NotionConfigProps) {
  const [databaseId, setDatabaseId] = useState(String(nodeData?.databaseId || ''))
  const [pageId, setPageId] = useState(String(nodeData?.pageId || ''))
  const [action, setAction] = useState(String(nodeData?.action || 'read'))
  const [properties, setProperties] = useState(String(nodeData?.properties || ''))
  const [filters, setFilters] = useState(String(nodeData?.filters || ''))
  const [sortBy, setSortBy] = useState(String(nodeData?.sortBy || ''))

  const handleChange = useCallback(() => {
    onChange?.({
      databaseId,
      pageId,
      action,
      properties,
      filters,
      sortBy,
    })
  }, [databaseId, pageId, action, properties, filters, sortBy, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Notion Configuration</h3>

      <div>
        <Label htmlFor="databaseId">Database ID</Label>
        <Input
          id="databaseId"
          placeholder="Database UUID"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="pageId">Page ID (Optional)</Label>
        <Input
          id="pageId"
          placeholder="Page UUID"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
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
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="query">Query</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="properties">Properties</Label>
        <Textarea
          id="properties"
          placeholder="name, email, status..."
          value={properties}
          onChange={(e) => setProperties(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="filters">Filters (JSON)</Label>
        <Textarea
          id="filters"
          placeholder='{"property": "status", "select": {"equals": "Active"}}'
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="sortBy">Sort By</Label>
        <Input
          id="sortBy"
          placeholder="Property name and direction (e.g., name-asc)"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}
