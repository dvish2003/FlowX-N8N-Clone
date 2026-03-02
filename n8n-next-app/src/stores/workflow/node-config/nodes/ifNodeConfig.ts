import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function ifNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'ifNode',
    position,
    data: {
      label: label || 'IF Condition',
      icon: icon || '/icons/if.png',
      conditions: [
        {
          variable: '',
          operator: 'equal',
          value: '',
        }
      ],
      combineOperation: 'AND',
    },
  } as NodeObjType
}
