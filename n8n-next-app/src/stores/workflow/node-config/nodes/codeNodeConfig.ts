import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function codeNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'codeNode',
    position,
    data: {
      label: label || 'Code',
      icon: icon || '/icons/brain.png',
      code: '// Enter your JavaScript here\nreturn input;'
    },
  } as NodeObjType
}
