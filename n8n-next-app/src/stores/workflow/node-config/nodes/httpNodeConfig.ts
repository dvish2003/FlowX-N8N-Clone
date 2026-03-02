import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function httpNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const httpNode: NodeObjType = {
    id: id,
    type: 'httpNode',
    position,
    data: {
      label: label || 'Http Request',
      icon: icon || '/icons/http.png',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: {},
      body: {},
      authentication: 'none',
      timeoutSeconds: 30,
      retries: 3,
      followRedirects: true,
      bodyJson: '{}',
      bodyType: 'json',
      headersArray: [],
      queryParams: {},
      queryParamsArray: [],
      basicAuth: { username: '', password: '' },
      apiKey: { key: '', value: '' },
      bearerToken: '',
      sendBody: true,
      sendHeaders: false,
      sendQueryParams: false,
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
            { nodeName: 'agent', handlePosition: 'top' },
            { nodeName: 'inputNode', handlePosition: 'top' },
            { nodeName: 'tool', handlePosition: 'top' },
            { nodeName: 'outputNode', handlePosition: 'top' },
            { nodeName: 'gmailNode', handlePosition: 'top' },
            { nodeName: 'driveNode', handlePosition: 'top' },
            { nodeName: 'notionNode', handlePosition: 'top' },
            { nodeName: 'calendarNode', handlePosition: 'top' },
            { nodeName: 'slackNode', handlePosition: 'top' },
            { nodeName: 'discordNode', handlePosition: 'top' },
            { nodeName: 'modelNode', handlePosition: 'top' },
            { nodeName: 'embeddingModelNode', handlePosition: 'top' },
            { nodeName: 'vectordbNode', handlePosition: 'top' },
            { nodeName: 'httpNode', handlePosition: 'top' },
            { nodeName: 'sendDataNode', handlePosition: 'top' },
            { nodeName: 'mongoDBNode', handlePosition: 'top' },
          ],
        },
      ],
    },
  } as NodeObjType

  return httpNode
}
