import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function retrieverNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const retrieverNode: NodeObjType = {
    id: id,
    type: 'retrieverNode',
    position,
    data: {
      label: label || 'Retriever',
      icon: icon || '/icons/search-file.png',
      file: null, // For PDF upload
      fileName: '',
      fileType: 'pdf'
    },
    constraints: {
      nodeHandles: [
        {
          name: 'top',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'bottom' }
          ]
        }
      ]
    }
  } as NodeObjType

  return retrieverNode
}
