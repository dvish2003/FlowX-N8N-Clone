import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function errorHandlerNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'errorHandlerNode',
    position,
    data: {
      label: label || 'Error Handler',
      icon: icon || '/icons/db.png',
      onFailure: 'retry',
      maxRetries: 3
    },
  } as NodeObjType
}
