"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type VectorDBConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function VectorDBConfig({ nodeId, nodeData, onChange }: VectorDBConfigProps) {
  const [dbType, setDbType] = useState(String(nodeData?.dbType || 'pinecone'))
  const [connectionString, setConnectionString] = useState(String(nodeData?.connectionString || ''))
  const [apiKey, setApiKey] = useState(String(nodeData?.apiKey || ''))
  const [namespace, setNamespace] = useState(String(nodeData?.namespace || ''))
  const [dimension, setDimension] = useState(String(nodeData?.dimension || '1536'))
  const [similarityThreshold, setSimilarityThreshold] = useState(String(nodeData?.similarityThreshold || '0.7'))
  const [indexName, setIndexName] = useState(String(nodeData?.indexName || ''))

  const handleChange = useCallback(() => {
    onChange?.({
      dbType,
      connectionString,
      apiKey,
      namespace,
      dimension,
      similarityThreshold,
      indexName,
    })
  }, [dbType, connectionString, apiKey, namespace, dimension, similarityThreshold, indexName, onChange])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <h3 className="font-semibold text-lg">Vector DB Configuration</h3>

      <div>
        <Label htmlFor="dbType">Database Type</Label>
        <Select value={dbType} onValueChange={setDbType}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select database type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pinecone">Pinecone</SelectItem>
            <SelectItem value="weaviate">Weaviate</SelectItem>
            <SelectItem value="qdrant">Qdrant</SelectItem>
            <SelectItem value="milvus">Milvus</SelectItem>
            <SelectItem value="chroma">Chroma</SelectItem>
            <SelectItem value="pgvector">PostgreSQL Vector</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="connectionString">Connection String</Label>
        <Input
          id="connectionString"
          placeholder="Connection details"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          placeholder="Your API key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="namespace">Namespace</Label>
        <Input
          id="namespace"
          placeholder="Namespace (if applicable)"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="dimension">Dimension</Label>
        <Input
          id="dimension"
          type="number"
          placeholder="1536"
          value={dimension}
          onChange={(e) => setDimension(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
        <Input
          id="similarityThreshold"
          type="number"
          placeholder="0.7"
          step="0.1"
          min="0"
          max="1"
          value={similarityThreshold}
          onChange={(e) => setSimilarityThreshold(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="indexName">Index Name</Label>
        <Input
          id="indexName"
          placeholder="Index or collection name"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}
