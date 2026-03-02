import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function googleSheetNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const googleSheetNode: NodeObjType = {
    id: id,
    type: 'googleSheetNode',
    position,
    data: {
      label: label || 'Google Sheets',
      icon: icon || '/icons/sheet.png',
      spreadsheetId: '',
      sheetName: 'Sheet1',
      columns: '',
      action: 'insert',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'input',
          type: 'target',
          LinkTo: [],
        },
        {
          name: 'output',
          type: 'source',
          LinkTo: [],
        },
      ],
    },
  } as NodeObjType

  return googleSheetNode
}
