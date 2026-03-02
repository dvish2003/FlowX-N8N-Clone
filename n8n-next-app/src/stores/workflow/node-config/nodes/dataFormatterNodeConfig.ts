import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function dataFormatterNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'dataFormatterNode',
    position,
    data: {
      label: label || 'Data Formatter',
      icon: icon || '/icons/retriever.png',
      mappings: [
        { from: '', to: '' }
      ],
      mode: 'map'
    },
  } as NodeObjType
}
