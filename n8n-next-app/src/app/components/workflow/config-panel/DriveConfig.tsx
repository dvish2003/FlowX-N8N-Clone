"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'

type DriveConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function DriveConfig({ nodeId, nodeData, onChange }: DriveConfigProps) {
  const dispatch = useDispatch()
  const [folderPath, setFolderPath] = useState(String(nodeData?.folderPath || ''))
  const [fileName, setFileName] = useState(String(nodeData?.fileName || ''))
  const [fileType, setFileType] = useState(String(nodeData?.fileType || 'document'))
  const [action, setAction] = useState(String(nodeData?.action || 'read'))
  const [description, setDescription] = useState(String(nodeData?.description || ''))
  const [isTrigger, setIsTrigger] = useState(Boolean(nodeData?.isTrigger || false))

  const handleSave = useCallback(() => {
    onChange?.({
      folderPath,
      fileName,
      fileType,
      action,
      description,
      isTrigger,
    })
  }, [folderPath, fileName, fileType, action, description, isTrigger, onChange])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Google Drive Configuration</h3>
      
      <div>
        <Label htmlFor="folderPath">Folder Path</Label>
        <Input
          id="folderPath"
          placeholder="/My Drive/Documents"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="fileName">File Name</Label>
        <Input
          id="fileName"
          placeholder="example.docx"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="fileType">File Type</Label>
        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="folder">Folder</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="action">Action</Label>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="share">Share</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Details about this operation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isTrigger"
            checked={isTrigger}
            onChange={(e) => setIsTrigger(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <Label htmlFor="isTrigger" className="cursor-pointer font-normal">
            This is a Trigger Event
          </Label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isTrigger ? '🔄 Trigger Event' : '⚙️ Performs Action'}
        </p>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        >
          Save Configuration
        </Button>
        <Button
          onClick={handleRemove}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
        >
          Remove Node
        </Button>
      </div>    </div>
  )
}
