import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function pdfConverterNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'pdfConverterNode',
    position,
    data: {
      label: label || 'PDF Converter',
      icon: icon || '/icons/retriever.png',
      fileName: '',
      outputFormat: 'csv', // 'csv' or 'excel'
    },
  } as NodeObjType
}
