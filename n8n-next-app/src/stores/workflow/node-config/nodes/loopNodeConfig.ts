import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function loopNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'loopNode',
    position,
    data: {
      label: label || 'Loop',
      icon: icon || '/icons/default.png',
      arrayPath: ''
    },
  } as NodeObjType
}
