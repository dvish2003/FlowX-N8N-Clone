import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function delayNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'delayNode',
    position,
    data: {
      label: label || 'Delay',
      icon: icon || '/icons/schedule.png',
      delay: 1,
      unit: 'seconds'
    },
  } as NodeObjType
}
