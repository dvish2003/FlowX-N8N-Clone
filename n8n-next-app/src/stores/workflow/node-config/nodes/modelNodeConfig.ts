import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function modelNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  // Map label to default model ID to prevent resetting to GPT-4o
  const defaultModel = label === 'Google Gemini' ? 'gemini-1.5-pro' : 
                       label === 'DeepSeek' ? 'deepseek-coder' : 
                       label === 'Mistral AI' ? 'mistral-large' : 
                       label === 'Qwen' ? 'qwen-max' : 'gpt-4o'

  const modelNode: NodeObjType = {
    id: id,
    type: 'modelNode',
    position,
    data: {
      label: label || 'AI Model',
      icon: icon || '/icons/brain.png',
      model: defaultModel,
      temperature: 0.7,
      apiKey: '',
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
        {
          name: 'left',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'right' },
            { nodeName: 'inputNode', handlePosition: 'right' },
          ],
        },
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'left' },
            { nodeName: 'outputNode', handlePosition: 'left' },
            { nodeName: 'vectordbNode', handlePosition: 'left' },
          ],
        },
      ],
    },
  } as NodeObjType

  return modelNode
}