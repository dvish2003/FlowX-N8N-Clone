"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Textarea } from '@/app/components/ui/textarea'
import { KeyValueEditor } from '@/app/components/ui/key-value-editor'
import { Play, Loader2, Link as LinkIcon, Shield, Settings2, Database, Globe, Zap } from 'lucide-react'

type HTTPRequestConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

type TabType = 'settings' | 'params' | 'body' | 'auth' | 'response'

export function HTTPRequestConfig({ nodeData, onChange }: HTTPRequestConfigProps) {
  const [activeTab, setActiveTab] = useState<TabType>('settings')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<Record<string, unknown> | null>(null)

  // Configuration State
  const [method, setMethod] = useState(String(nodeData?.method || 'GET'))
  const [url, setUrl] = useState(String(nodeData?.url || ''))
  const [authentication, setAuthentication] = useState(String(nodeData?.authentication || 'none'))
  
  // Auth details
  const [basicAuth, setBasicAuth] = useState(nodeData?.basicAuth as {username?: string, password?: string} || { username: '', password: '' })
  const [bearerToken, setBearerToken] = useState(String(nodeData?.bearerToken || ''))
  const [apiKey, setApiKey] = useState(nodeData?.apiKey as {key?: string, value?: string} || { key: '', value: '' })

  // Collections for headers and params
  const [headers, setHeaders] = useState<Array<{ id: string, key: string, value: string }>>(
    (nodeData?.headersArray as Array<{ id: string, key: string, value: string }>) || []
  )
  const [queryParams, setQueryParams] = useState<Array<{ id: string, key: string, value: string }>>(
    (nodeData?.queryParamsArray as Array<{ id: string, key: string, value: string }>) || []
  )

  // Body
  const [bodyType, setBodyType] = useState(String(nodeData?.bodyType || 'json'))
  const [bodyJson, setBodyJson] = useState(String(nodeData?.bodyJson || '{}'))
  
  // Options
  const [timeoutSeconds, setTimeoutSeconds] = useState(String(nodeData?.timeoutSeconds || '30'))
  const [retries, setRetries] = useState(String(nodeData?.retries || '0'))
  const [followRedirects, setFollowRedirects] = useState(Boolean(nodeData?.followRedirects ?? true))
  const [executionMode, setExecutionMode] = useState(String(nodeData?.executionMode || 'auto'))

  const updateParent = useCallback((updates: Record<string, unknown> = {}) => {
    const headersObj = headers.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
    const queryParamsObj = queryParams.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})

    let bodyPayload = {}
    try {
      if (bodyType === 'json') {
        bodyPayload = JSON.parse(bodyJson)
      }
    } catch { }

    onChange?.({
      method,
      url,
      authentication,
      basicAuth,
      bearerToken,
      apiKey,
      headers: headersObj,
      headersArray: headers, 
      queryParams: queryParamsObj,
      queryParamsArray: queryParams, 
      body: bodyPayload,
      bodyJson,
      bodyType,
      timeoutSeconds: Number(timeoutSeconds),
      retries: Number(retries),
      followRedirects,
      executionMode,
      // Add these critical flags
      sendHeaders: headers.length > 0,
      sendQueryParams: queryParams.length > 0,
      sendBody: method !== 'GET' && method !== 'HEAD',
      ...updates
    })
  }, [method, url, authentication, basicAuth, bearerToken, apiKey, headers, queryParams, bodyJson, bodyType, timeoutSeconds, retries, followRedirects, executionMode, onChange])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateParent()
    }, 500)
    return () => clearTimeout(timer)
  }, [updateParent])

  const handleTestRequest = async () => {
    setLoading(true)
    setActiveTab('response')
    setResponse(null)

    try {
      const config = {
        method,
        url,
        authentication,
        basicAuth,
        bearerToken,
        apiKey,
        headers: headers.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        queryParams: queryParams.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        body: bodyType === 'json' ? JSON.parse(bodyJson) : {}, 
        timeoutSeconds: Number(timeoutSeconds),
        retries: Number(retries),
        followRedirects,
        sendHeaders: headers.length > 0,
        sendQueryParams: queryParams.length > 0,
        sendBody: method !== 'GET' && method !== 'HEAD',
      }

      const res = await fetch('/api/nodes/test-http', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await res.json()
      setResponse(data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Request failed'
      setResponse({ error: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
             <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              HTTP Request
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect to external APIs</p>
          </div>
        </div>
        <Button 
          size="lg" 
          onClick={handleTestRequest}
          disabled={loading || !url}
          className="rounded-2xl bg-[var(--primary)] hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 gap-2 px-6 h-12 font-bold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          Execute
        </Button>
      </div>

      {/* Modern Tabs */}
      <div className="flex px-4 py-2 bg-slate-50/50 border-b border-slate-100 gap-1 overflow-x-auto scroller-hidden">
        {[
          { id: 'settings', label: 'Setup', icon:  Settings2},
          { id: 'params', label: 'Payload', icon: Database },
          { id: 'auth', label: 'Security', icon: Shield },
          { id: 'response', label: 'Inspect', icon: Database }
        ].map(tab => (
           <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-[var(--primary)] border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[var(--primary)]' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* SETUP TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Endpoint Configuration</Label>
              <div className="flex gap-0 shadow-sm rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/5 transition-all bg-white group">
                <div className="w-32 border-r border-slate-100 bg-slate-50/30 group-focus-within:bg-white transition-colors">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="border-none text-slate-900 h-12 font-black rounded-none shadow-none focus:ring-0 bg-transparent hover:bg-slate-100/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 text-slate-900 shadow-xl overflow-hidden rounded-xl">
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(m => (
                        <SelectItem key={m} value={m} className="font-mono text-sm focus:bg-slate-100 cursor-pointer">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="https://api.yourdomain.com/v1/..."
                  className="flex-1 bg-transparent border-none text-slate-900 font-mono text-xs h-12 rounded-none focus-visible:ring-0 px-4"
                />
              </div>
            </div>

            <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
               <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Request Tuning</h4>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 font-semibold">Timeout (Seconds)</Label>
                    <Input 
                      type="number" 
                      value={timeoutSeconds} 
                      onChange={e => setTimeoutSeconds(e.target.value)}
                      className="bg-white border-slate-200 rounded-xl h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 font-semibold">Retry Buffer</Label>
                    <Input 
                      type="number" 
                      value={retries} 
                      onChange={e => setRetries(e.target.value)}
                      className="bg-white border-slate-200 rounded-xl h-10"
                    />
                  </div>
               </div>

                <div className="flex items-center justify-between pt-2">
                   <Label htmlFor="redirects" className="cursor-pointer font-bold text-slate-700 text-xs">Follow Automatic Redirects</Label>
                   <input 
                     type="checkbox" 
                     checked={followRedirects}
                     onChange={e => setFollowRedirects(e.target.checked)}
                     id="redirects"
                     className="w-10 h-6 rounded-full appearance-none bg-slate-200 checked:bg-blue-500 transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-transform"
                   />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Execution Management</Label>
                    <div className="flex flex-col gap-2">
                        <div 
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${executionMode === 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-100 bg-neutral-50 hover:border-neutral-200'}`} 
                        onClick={() => setExecutionMode('manual')}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${executionMode === 'manual' ? 'border-blue-500' : 'border-neutral-300'}`}>
                                    {executionMode === 'manual' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <span className="text-xs font-bold text-slate-900">Manual Approval</span>
                            </div>
                            <p className="text-[10px] text-slate-500 pl-6 mt-0.5">Pause workflow for manual confirmation</p>
                        </div>
                        
                        <div 
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${executionMode !== 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-neutral-100 bg-neutral-50 hover:border-neutral-200'}`} 
                        onClick={() => setExecutionMode('auto')}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${executionMode !== 'manual' ? 'border-blue-500' : 'border-neutral-300'}`}>
                                    {executionMode !== 'manual' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <span className="text-xs font-bold text-slate-900">Automated</span>
                            </div>
                            <p className="text-[10px] text-slate-500 pl-6 mt-0.5">Execute immediately when triggered</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* PARAMETERS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Query Parameters</h4>
                </div>
                <KeyValueEditor 
                items={queryParams} 
                onChange={setQueryParams} 
                addButtonLabel="Add Parameter"
                />
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Headers</h4>
                <KeyValueEditor 
                    items={headers} 
                    onChange={setHeaders} 
                    addButtonLabel="Add Header"
                />
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Request Body</h4>
              {(method === 'GET' || method === 'HEAD') ? (
                <div className="py-8 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                   <p className="text-xs text-slate-400 font-medium">
                      Body is not supported for {method} requests.
                   </p>
                </div>
              ) : (
                <div className="space-y-4">
                   <Select value={bodyType} onValueChange={setBodyType}>
                      <SelectTrigger className="border-slate-200 font-bold rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 text-slate-900 shadow-xl overflow-hidden rounded-xl">
                        <SelectItem value="json" className="focus:bg-slate-100 cursor-pointer">application/json</SelectItem>
                        <SelectItem value="form-data" disabled>multipart/form-data</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative group">
                       <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-300 pointer-events-none uppercase">JSON Editor</div>
                       <Textarea 
                          value={bodyJson}
                          onChange={e => setBodyJson(e.target.value)}
                          className="font-mono text-xs bg-slate-900 text-slate-100 border-none rounded-2xl p-6 h-64 focus:ring-4 focus:ring-blue-500/10 transition-all selection:bg-blue-500/30"
                          placeholder="{}"
                       />
                    </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTH TAB */}
        {activeTab === 'auth' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Access Method</Label>
                <Select value={authentication} onValueChange={setAuthentication}>
                  <SelectTrigger className="border-slate-200 font-black h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 text-slate-900 shadow-xl overflow-hidden rounded-xl">
                    <SelectItem value="none" className="focus:bg-slate-100 cursor-pointer">Public (No Auth)</SelectItem>
                    <SelectItem value="basic" className="focus:bg-slate-100 cursor-pointer">Basic Credentials</SelectItem>
                    <SelectItem value="bearer" className="focus:bg-slate-100 cursor-pointer">Bearer Token</SelectItem>
                    <SelectItem value="apikey" className="focus:bg-slate-100 cursor-pointer">API Key / Secret</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             {authentication !== 'none' && (
                 <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner">
                    {authentication === 'basic' && (
                        <>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 ml-1">Username</Label>
                            <Input 
                                value={basicAuth.username}
                                onChange={e => setBasicAuth({...basicAuth, username: e.target.value})}
                                className="bg-white border-slate-200 rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 ml-1">Password / Token</Label>
                            <Input 
                                type="password"
                                value={basicAuth.password}
                                onChange={e => setBasicAuth({...basicAuth, password: e.target.value})}
                                className="bg-white border-slate-200 rounded-xl h-11"
                            />
                        </div>
                        </>
                    )}

                    {authentication === 'bearer' && (
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 ml-1">Access Token</Label>
                            <Input 
                                type="password"
                                value={bearerToken}
                                onChange={e => setBearerToken(e.target.value)}
                                placeholder="sk-..."
                                className="bg-white border-slate-200 rounded-xl h-11 font-mono"
                            />
                        </div>
                    )}

                    {authentication === 'apikey' && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-600 ml-1">Header Key Name</Label>
                                <Input 
                                    value={apiKey.key}
                                    onChange={e => setApiKey({...apiKey, key: e.target.value})}
                                    placeholder="X-API-Key"
                                    className="bg-white border-slate-200 rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-600 ml-1">Secret Value</Label>
                                <Input 
                                    type="password"
                                    value={apiKey.value}
                                    onChange={e => setApiKey({...apiKey, value: e.target.value})}
                                    className="bg-white border-slate-200 rounded-xl h-11"
                                />
                            </div>
                        </>
                    )}
                 </div>
             )}
             {authentication === 'none' && (
               <div className="py-12 px-6 flex flex-col items-center text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                    <Shield className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">This request is public <br /> No credentials will be transmitted</p>
               </div>
             )}
           </div>
        )}

        {/* OUTPUT TAB */}
        {activeTab === 'response' && (
           <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {!response ? (
                 <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                      <Database className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Execution Output</p>
                 </div>
              ) : (
                 <div className="space-y-6 h-full flex flex-col">
                    <div className={`p-6 rounded-[2.5rem] border flex items-center justify-between shadow-sm transition-all duration-700 ${response?.success ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${response?.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {response?.success ? <Zap className="w-5 h-5 fill-current" /> : <Settings2 className="w-5 h-5" />}
                         </div>
                         <div className="flex flex-col">
                           <span className={`text-[10px] font-black tracking-widest uppercase ${response?.success ? 'text-green-600' : 'text-red-600'}`}>
                              {response?.success ? 'Sequence Completed' : 'Handshake Failed'}
                           </span>
                           <span className="text-lg font-black text-slate-900 tracking-tight">
                              HTTP {(response?.data as any)?.status || 'ERROR'}
                           </span>
                         </div>
                       </div>
                       {(response?.data as any)?.executionTime && (
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Latency</span>
                              <span className="text-xl font-black text-slate-900">{(response.data as any).executionTime}ms</span>
                           </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-3 min-h-0 flex flex-col">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Data / Payload</Label>
                        <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Copy JSON</button>
                      </div>
                      <div className="flex-1 bg-slate-900 rounded-[2rem] p-6 overflow-auto border-2 border-slate-800 shadow-2xl relative">
                         <div className="absolute top-6 right-6 text-[8px] font-mono text-slate-500 uppercase tracking-widest">Preview Mode</div>
                         <pre className="text-xs font-mono text-blue-200/90 whitespace-pre-wrap leading-relaxed">
                           {JSON.stringify((response?.data as any)?.data || response?.error || response, null, 2)}
                         </pre>
                      </div>
                    </div>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  )
}
