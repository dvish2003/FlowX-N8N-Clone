"use client"

import React from 'react'
import { GmailConfig } from './GmailConfig'
import { DriveConfig } from './DriveConfig'
import { SlackConfig } from './SlackConfig'
import { DiscordConfig } from './DiscordConfig'
import { CalendarConfig } from './CalendarConfig'
import { NotionConfig } from './NotionConfig'
import { VectorDBConfig } from './VectorDBConfig'
import { EmbeddingModelConfig } from './EmbeddingModelConfig'
import { MongoDBConfig } from './MongoDBConfig'
import { ModelNodeConfig } from './ModelNodeConfig'
import { ToolConfig } from './ToolConfig'
import { AgentConfig } from './AgentConfig'
import { SubAgentConfig } from './SubAgentConfig'
import { InputNodeConfig } from './InputNodeConfig'
import { OutputNodeConfig } from './OutputNodeConfig'
import { ScheduleTriggerConfig } from './ScheduleTriggerConfig'
import { HTTPRequestConfig } from './HTTPRequestConfig'
import { ChatTriggerConfig } from './ChatTriggerConfig'
import { RetrieverConfig } from './RetrieverConfig'
import { SendDataConfig } from './SendDataConfig'
import { GoogleSheetConfig } from './GoogleSheetConfig'
import { IfConfig } from './IfConfig'
import { SwitchConfig } from './SwitchConfig'
import { DelayConfig } from './DelayConfig'
import { EmailConfig } from './EmailConfig'
import { TelegramConfig } from './TelegramConfig'
import { WebhookConfig } from './WebhookConfig'
import { DataFormatterConfig } from './DataFormatterConfig'
import { CodeConfig } from './CodeConfig'
import { LoopConfig } from './LoopConfig'
import { ErrorHandlerConfig } from './ErrorHandlerConfig'
import { WhatsAppConfig } from './WhatsAppConfig'


type ConfigPanelSelectorProps = {
  nodeId?: string
  nodeType?: string
  nodeData?: Record<string, unknown>
  onChange?: (data: Record<string, unknown>) => void
  nodes?: any[]
  edges?: any[]
}

export function ConfigPanelSelector({ nodeId, nodeType, nodeData, onChange, nodes, edges }: ConfigPanelSelectorProps) {
  if (!nodeType) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a node to view its properties
      </div>
    )
  }

  switch (nodeType) {
    case 'gmailNode':
      return <GmailConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'driveNode':
      return <DriveConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'slackNode':
      return <SlackConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'discordNode':
      return <DiscordConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'calendarNode':
      return <CalendarConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'notionNode':
      return <NotionConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'vectordbNode':
      return <VectorDBConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'embeddingModelNode':
      return <EmbeddingModelConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'mongoDBNode':
      return <MongoDBConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} nodes={nodes} edges={edges} />
    case 'modelNode':
      return <ModelNodeConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'tool':
      return <ToolConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'agent':
      return <AgentConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'subAgent':
      return <SubAgentConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'inputNode':
      return <InputNodeConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'outputNode':
      return <OutputNodeConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'scheduleTriggerNode':
      return <ScheduleTriggerConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'httpNode':
      return <HTTPRequestConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'chatTriggerNode':
      return <ChatTriggerConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'retrieverNode':
      return <RetrieverConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'sendDataNode':
      return <SendDataConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'googleSheetNode':
      return <GoogleSheetConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'ifNode':
      return <IfConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'switchNode':
      return <SwitchConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'delayNode':
      return <DelayConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'emailNode':
      return <EmailConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'telegramNode':
      return <TelegramConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'webhookNode':
      return <WebhookConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'dataFormatterNode':
      return <DataFormatterConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'codeNode':
      return <CodeConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'loopNode':
      return <LoopConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'errorHandlerNode':
      return <ErrorHandlerConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />
    case 'whatsAppNode':
      return <WhatsAppConfig key={nodeId} nodeId={nodeId} nodeData={nodeData} onChange={onChange} />

    default:
      return (
        <div className="p-4 text-center text-gray-500">
          No configuration available for this node type: {nodeType}
        </div>
      )
  }
}
