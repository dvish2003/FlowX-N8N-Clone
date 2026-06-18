import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function csvLoaderNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'csvLoaderNode',
    position,
    data: {
      label: label || 'CSV Loader',
      icon: icon || '/icons/sheet.png',
      fileName: '',
      csvData: '',
      loadData: true,
    },
  } as NodeObjType
}
