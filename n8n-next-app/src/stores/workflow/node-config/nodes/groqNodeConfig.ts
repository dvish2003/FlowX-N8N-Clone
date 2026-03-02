import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function groqNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id: id,
    type: 'modelNode',
    position,
    data: {
      label: label || 'Groq Llama 3',
      icon: icon || '/icons/meta_nnmll6.webp',
      model: 'llama3-70b-8192',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY || '',
      parameters: {
        temperature: 0.7,
        maxTokens: 2048,
      },
      settings: {
        credential: 'Select Credential',
      }
    },
    constraints: {
      nodeHandles: [
        {
          name: 'top',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'bottom' },
          ],
        },
      ],
    },
  } as NodeObjType
}
