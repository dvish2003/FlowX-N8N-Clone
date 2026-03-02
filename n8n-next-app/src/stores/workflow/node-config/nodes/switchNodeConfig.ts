import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function switchNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'switchNode',
    position,
    data: {
      label: label || 'Switch',
      icon: icon || '/icons/switch.png',
      variable: '',
      cases: [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' }
      ],
      defaultCase: true
    },
  } as NodeObjType
}
