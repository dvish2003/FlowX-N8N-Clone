import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function sendDataNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const sendDataNode: NodeObjType = {
    id: id,
    type: 'sendDataNode',
    position,
    data: {
      label: label || 'Send Data',
      icon: icon || '/icons/send.png',
      
      // Destination Configuration
      destinationType: 'http', // 'http', 'email', 'webhook', 'multiple'
      
      // HTTP Configuration
      httpMethod: 'POST',
      httpUrl: '',
      httpHeaders: {},
      httpHeadersArray: [],
      httpAuthentication: 'none',
      httpBasicAuth: { username: '', password: '' },
      httpApiKey: { key: '', value: '' },
      httpBearerToken: '',
      httpTimeout: 30,
      httpRetries: 3,
      
      // Email Configuration
      emailProvider: 'smtp', // 'smtp', 'gmail', 'sendgrid', 'mailgun'
      emailFrom: '',
      emailTo: '',
      emailCc: '',
      emailBcc: '',
      emailSubject: '',
      emailBody: '',
      emailBodyType: 'html', // 'html', 'text'
      emailAttachments: [],
      
      // SMTP Configuration
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: true,
      smtpUsername: '',
      smtpPassword: '',
      
      // Webhook Configuration
      webhookUrl: '',
      webhookMethod: 'POST',
      webhookHeaders: {},
      webhookSecret: '',
      
      // Multiple Destinations
      multipleDestinations: [],
      
      // Data Transformation
      dataMapping: 'passthrough', // 'passthrough', 'custom', 'template'
      customTemplate: '',
      dataTransform: {},
      
      // Response Handling
      saveResponse: true,
      responseFormat: 'json',
      onSuccess: 'continue',
      onError: 'stop',
      retryOnFail: true,
      maxRetries: 3,
      
      // Advanced Options
      includeTimestamp: true,
      includeMetadata: false,
      batchMode: false,
      batchSize: 10,
      throttleRequests: false,
      throttleInterval: 1000,
    },
    constraints: {
      nodeHandles: [
        {
          name: 'input',
          type: 'target',
          LinkTo: [],
        },
        {
          name: 'output',
          type: 'source',
          LinkTo: [
            { nodeName: 'outputNode', handlePosition: 'top' },
            { nodeName: 'sendDataNode', handlePosition: 'top' },
          ],
        },
      ],
    },
  } as NodeObjType

  return sendDataNode
}
