"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Button } from '@/app/components/ui/button'
import { useDispatch } from 'react-redux'
import { deleteNode } from '@/stores/FlowSlice'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'

type SendDataConfigProps = {
  nodeId?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
}

export function SendDataConfig({ nodeId, nodeData, onChange }: SendDataConfigProps) {
  const dispatch = useDispatch()
  
  const [destinationType, setDestinationType] = useState(String(nodeData?.destinationType || 'http'))
  
  const [httpMethod, setHttpMethod] = useState(String(nodeData?.httpMethod || 'POST'))
  const [httpUrl, setHttpUrl] = useState(String(nodeData?.httpUrl || ''))
  const [httpHeadersArray, setHttpHeadersArray] = useState<Array<{ key: string; value: string }>>(
    (nodeData?.httpHeadersArray as Array<{ key: string; value: string }>) || []
  )
  const [httpAuthentication, setHttpAuthentication] = useState(String(nodeData?.httpAuthentication || 'none'))
  const [httpBearerToken, setHttpBearerToken] = useState(String(nodeData?.httpBearerToken || ''))
  const [httpTimeout, setHttpTimeout] = useState(Number(nodeData?.httpTimeout || 30))
  
  const [emailProvider, setEmailProvider] = useState(String(nodeData?.emailProvider || 'smtp'))
  const [emailFrom, setEmailFrom] = useState(String(nodeData?.emailFrom || ''))
  const [emailTo, setEmailTo] = useState(String(nodeData?.emailTo || ''))
  const [emailSubject, setEmailSubject] = useState(String(nodeData?.emailSubject || ''))
  const [emailBody, setEmailBody] = useState(String(nodeData?.emailBody || ''))
  const [emailBodyType, setEmailBodyType] = useState(String(nodeData?.emailBodyType || 'html'))
  
  const [smtpHost, setSmtpHost] = useState(String(nodeData?.smtpHost || ''))
  const [smtpPort, setSmtpPort] = useState(Number(nodeData?.smtpPort || 587))
  const [smtpUsername, setSmtpUsername] = useState(String(nodeData?.smtpUsername || ''))
  const [smtpPassword, setSmtpPassword] = useState(String(nodeData?.smtpPassword || ''))
  
  const [dataMapping, setDataMapping] = useState(String(nodeData?.dataMapping || 'passthrough'))
  const [customTemplate, setCustomTemplate] = useState(String(nodeData?.customTemplate || ''))
  
  const [saveResponse, setSaveResponse] = useState(Boolean(nodeData?.saveResponse ?? true))
  const [retryOnFail, setRetryOnFail] = useState(Boolean(nodeData?.retryOnFail ?? true))
  const [maxRetries, setMaxRetries] = useState(Number(nodeData?.maxRetries || 3))

  const addHeader = useCallback(() => {
    setHttpHeadersArray([...httpHeadersArray, { key: '', value: '' }])
  }, [httpHeadersArray])

  const updateHeader = useCallback((index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...httpHeadersArray]
    newHeaders[index][field] = value
    setHttpHeadersArray(newHeaders)
  }, [httpHeadersArray])

  const removeHeader = useCallback((index: number) => {
    setHttpHeadersArray(httpHeadersArray.filter((_, i) => i !== index))
  }, [httpHeadersArray])

  const handleSave = useCallback(() => {
    const headers: Record<string, string> = {}
    httpHeadersArray.forEach(({ key, value }) => {
      if (key && value) headers[key] = value
    })

    onChange?.({
      destinationType,
      httpMethod,
      httpUrl,
      httpHeaders: headers,
      httpHeadersArray,
      httpAuthentication,
      httpBearerToken,
      httpTimeout,
      emailProvider,
      emailFrom,
      emailTo,
      emailSubject,
      emailBody,
      emailBodyType,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      dataMapping,
      customTemplate,
      saveResponse,
      retryOnFail,
      maxRetries,
    })
  }, [
    destinationType,
    httpMethod,
    httpUrl,
    httpHeadersArray,
    httpAuthentication,
    httpBearerToken,
    httpTimeout,
    emailProvider,
    emailFrom,
    emailTo,
    emailSubject,
    emailBody,
    emailBodyType,
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpPassword,
    dataMapping,
    customTemplate,
    saveResponse,
    retryOnFail,
    maxRetries,
    onChange,
  ])

  const handleRemove = useCallback(() => {
    if (nodeId && window.confirm('Are you sure you want to remove this node?')) {
      dispatch(deleteNode(nodeId))
    }
  }, [nodeId, dispatch])

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg max-h-[600px] overflow-y-auto">
      <h3 className="font-semibold text-lg sticky top-0 bg-white pb-2 border-b">Send Data Configuration</h3>
      
      <div>
        <Label htmlFor="destinationType">Destination Type</Label>
        <select
          id="destinationType"
          value={destinationType}
          onChange={(e) => setDestinationType(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="http">HTTP Request</option>
          <option value="email">Email</option>
          <option value="webhook">Webhook</option>
          <option value="multiple">Multiple Destinations</option>
        </select>
      </div>

      <Tabs value={destinationType} onValueChange={setDestinationType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="http">HTTP</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="http" className="space-y-4">
          <div>
            <Label htmlFor="httpMethod">HTTP Method</Label>
            <select
              id="httpMethod"
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <Label htmlFor="httpUrl">URL</Label>
            <Input
              id="httpUrl"
              placeholder="https://example.com/api/endpoint"
              value={httpUrl}
              onChange={(e) => setHttpUrl(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Frontend URL, API endpoint, or webhook URL
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Headers</Label>
              <Button
                onClick={addHeader}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Add Header
              </Button>
            </div>
            {httpHeadersArray.map((header, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                />
                <Button
                  onClick={() => removeHeader(index)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="httpAuthentication">Authentication</Label>
            <select
              id="httpAuthentication"
              value={httpAuthentication}
              onChange={(e) => setHttpAuthentication(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="apiKey">API Key</option>
            </select>
          </div>

          {httpAuthentication === 'bearer' && (
            <div>
              <Label htmlFor="httpBearerToken">Bearer Token</Label>
              <Input
                id="httpBearerToken"
                type="password"
                placeholder="Enter bearer token"
                value={httpBearerToken}
                onChange={(e) => setHttpBearerToken(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="httpTimeout">Timeout (seconds)</Label>
            <Input
              id="httpTimeout"
              type="number"
              value={httpTimeout}
              onChange={(e) => setHttpTimeout(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div>
            <Label htmlFor="emailProvider">Email Provider</Label>
            <select
              id="emailProvider"
              value={emailProvider}
              onChange={(e) => setEmailProvider(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="smtp">SMTP</option>
              <option value="gmail">Gmail</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>

          <div>
            <Label htmlFor="emailFrom">From Email</Label>
            <Input
              id="emailFrom"
              placeholder="sender@example.com"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="emailTo">To Email(s)</Label>
            <Input
              id="emailTo"
              placeholder="recipient@example.com, another@example.com"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <Label htmlFor="emailSubject">Subject</Label>
            <Input
              id="emailSubject"
              placeholder="Email subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use &#123;&#123;data&#125;&#125; to insert workflow data
            </p>
          </div>

          <div>
            <Label htmlFor="emailBodyType">Body Type</Label>
            <select
              id="emailBodyType"
              value={emailBodyType}
              onChange={(e) => setEmailBodyType(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="html">HTML</option>
              <option value="text">Plain Text</option>
            </select>
          </div>

          <div>
            <Label htmlFor="emailBody">Email Body</Label>
            <Textarea
              id="emailBody"
              placeholder="Email content"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="mt-1"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use &#123;&#123;data&#125;&#125; or &#123;&#123;data.field&#125;&#125; to insert workflow data
            </p>
          </div>

          {emailProvider === 'smtp' && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">SMTP Configuration</h4>
              </div>

              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.gmail.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  placeholder="username"
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>Webhook Mode:</strong> Sends data to a webhook URL with automatic retry and failure handling
          </div>
          <p className="text-xs text-gray-500">
            Configuration similar to HTTP, optimized for webhooks
          </p>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4 space-y-4">
        <h4 className="font-semibold">Data Transformation</h4>
        
        <div>
          <Label htmlFor="dataMapping">Data Mapping</Label>
          <select
            id="dataMapping"
            value={dataMapping}
            onChange={(e) => setDataMapping(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="passthrough">Pass Through (Send All Data)</option>
            <option value="template">Use Template</option>
            <option value="custom">Custom Mapping</option>
          </select>
        </div>

        {dataMapping === 'template' && (
          <div>
            <Label htmlFor="customTemplate">Data Template (JSON)</Label>
            <Textarea
              id="customTemplate"
              placeholder='{"message": "{{data.message}}", "timestamp": "{{timestamp}}"}'
              value={customTemplate}
              onChange={(e) => setCustomTemplate(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use &#123;&#123;data.field&#125;&#125; to reference incoming data
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-semibold">Advanced Options</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveResponse"
            checked={saveResponse}
            onChange={(e) => setSaveResponse(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <Label htmlFor="saveResponse" className="cursor-pointer font-normal">
            Save Response Data
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="retryOnFail"
            checked={retryOnFail}
            onChange={(e) => setRetryOnFail(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <Label htmlFor="retryOnFail" className="cursor-pointer font-normal">
            Retry on Failure
          </Label>
        </div>

        {retryOnFail && (
          <div>
            <Label htmlFor="maxRetries">Max Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              min="1"
              max="10"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t sticky bottom-0 bg-white">
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
      </div>
    </div>
  )
}
