"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Database, Server, User, Lock, Globe, AlertCircle, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

type MongoDBConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
  nodes?: any[]
  edges?: any[]
}

export function MongoDBConfig({ nodeId, nodeData, onChange, nodes = [], edges = [] }: MongoDBConfigProps) {
  // Find connected nodes (upstream)
  const incomingProperties = React.useMemo(() => {
    if (!nodeId || !nodes.length || !edges.length) return []
    
    // Find edges pointing to this node
    const incomingEdges = edges.filter(e => e.target === nodeId)
    const sourceNodes = incomingEdges.map(e => nodes.find(n => n.id === e.source)).filter(Boolean)
    console.log(sourceNodes)
    const props = new Set<string>()
    
    sourceNodes.forEach(node => {
      // 1. Check if it's an HTTP node and has sample JSON in body
      if (node.type === 'httpNode' || node.type === 'httpRequest') {
        try {
          const bodyJson = node.data?.bodyJson
          if (bodyJson) {
            const parsed = JSON.parse(String(bodyJson))
            Object.keys(parsed).forEach(k => props.add(k))
          }
        } catch {}
      }
      
      // 2. Add some defaults based on node type
      if (node.type === 'googleSheetNode') {
        const columns = node.data?.columns as string[]
        if (columns) columns.forEach(c => props.add(c))
      }
    })
    
    return Array.from(props)
  }, [nodeId, nodes, edges])

  const [connectionType, setConnectionType] = useState(String(nodeData?.connectionType || 'local'))
  const [database, setDatabase] = useState(String(nodeData?.database || 'flow_x'))
  const [collection, setCollection] = useState(String(nodeData?.collection || 'data'))
  const [user, setUser] = useState(String(nodeData?.user || ''))
  const [password, setPassword] = useState(String(nodeData?.password || ''))
  const [connectionString, setConnectionString] = useState(String(nodeData?.connectionString || 'mongodb://localhost:27017'))
  
  const [checkDuplicateKey, setCheckDuplicateKey] = useState(Boolean(nodeData?.checkDuplicateKey || false))
  const [duplicateKeyField, setDuplicateKeyField] = useState(String(nodeData?.duplicateKeyField || 'id'))
  const [duplicateAction, setDuplicateAction] = useState(String(nodeData?.duplicateAction || 'skip'))

  useEffect(() => {
    onChange?.({
      connectionType,
      database,
      collection,
      user,
      password,
      connectionString,
      checkDuplicateKey,
      duplicateKeyField: checkDuplicateKey ? duplicateKeyField : undefined,
      duplicateAction: checkDuplicateKey ? duplicateAction : undefined
    })
  }, [
    connectionType, 
    database, 
    collection, 
    user, 
    password, 
    connectionString, 
    checkDuplicateKey, 
    duplicateKeyField, 
    duplicateAction,
    onChange
  ])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-600 text-white rounded-xl shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">MongoDB</h3>
            <p className="text-xs text-slate-500">Document Database</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            Connection Type
          </Label>
          <Select value={connectionType} onValueChange={setConnectionType}>
            <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Localhost</SelectItem>
              <SelectItem value="cluster">Atlas Cluster</SelectItem>
              <SelectItem value="string">Connection String</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {connectionType === 'local' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Server className="w-4 h-4" />
                <span className="text-xs font-medium">Local MongoDB</span>
              </div>
              <Input 
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="mongodb://localhost:27017"
                className="h-10 bg-white border-blue-200 text-sm font-mono"
              />
              <p className="text-xs text-blue-600 mt-2">Default: mongodb://localhost:27017</p>
            </div>
          </div>
        )}

        {connectionType === 'cluster' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">Atlas Connection</span>
              </div>
              <Input 
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="mongodb+srv://cluster0.abc123.mongodb.net"
                className="h-10 bg-white border-purple-200 text-sm font-mono"
              />
            </div>
          </div>
        )}

        {connectionType === 'string' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <Label className="text-xs font-medium text-slate-700 mb-2 block">
                Connection String
              </Label>
              <Input 
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="mongodb://username:password@host:port/database"
                className="h-10 bg-white border-slate-200 text-sm font-mono"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              Database
            </Label>
            <Input 
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              placeholder="flow_x"
              className="h-10 bg-white border-slate-200 rounded-lg"
            />
            <p className="text-xs text-slate-500">Default: flow_x</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
              Collection
            </Label>
            <Input 
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="data"
              className="h-10 bg-white border-slate-200 rounded-lg"
            />
            <p className="text-xs text-slate-500">Default: data</p>
          </div>
        </div>

        {(connectionType === 'cluster' || connectionType === 'string') && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Username
              </Label>
              <Input 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="username"
                className="h-10 bg-white border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                Password
              </Label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 bg-white border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <Zap className="w-4 h-4 text-blue-600 fill-current" />
              Neural Sync Automation
            </Label>
            <button
              onClick={() => setCheckDuplicateKey(!checkDuplicateKey)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                checkDuplicateKey ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  checkDuplicateKey ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {checkDuplicateKey && (
            <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 block">
                    Unique Key Field
                  </Label>
                  <Input 
                    value={duplicateKeyField}
                    onChange={(e) => setDuplicateKeyField(e.target.value)}
                    placeholder="id, email, custom_id, etc."
                    className="h-10 bg-white border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mb-2">
                    Documents with duplicate {duplicateKeyField || 'key'} will trigger the action below
                  </p>
                  {incomingProperties.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <Label className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Detected from Upstream</Label>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {incomingProperties.map(field => (
                          <button
                            key={field}
                            onClick={() => setDuplicateKeyField(field)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              duplicateKeyField === field 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Common Defaults</Label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['id', 'email', 'contact', 'sku', 'user_id'].map(field => (
                      <button
                        key={field}
                        onClick={() => setDuplicateKeyField(field)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          duplicateKeyField === field 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-700 block">
                    On Duplicate
                  </Label>
                  <Select value={duplicateAction} onValueChange={setDuplicateAction}>
                    <SelectTrigger className="h-10 bg-white border-slate-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip (Keep Original)</SelectItem>
                      <SelectItem value="update">Update (Overwrite)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                    {duplicateAction === 'skip' ? (
                        <>
                            <span className="font-medium">Skip:</span> Only inserts if {duplicateKeyField || 'key'} is new.
                        </>
                    ) : (
                        <>
                            <span className="font-medium">Update:</span> Replaces existing document if {duplicateKeyField || 'key'} matches.
                        </>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}