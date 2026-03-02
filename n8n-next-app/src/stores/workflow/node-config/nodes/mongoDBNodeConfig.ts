import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function mongoDBNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id: id,
    type: 'mongoDBNode',
    position,
    data: {
      label: label || 'MongoDB',
      icon: icon || '/icons/mongodb.png',
      connectionType: 'local',
      database: 'flow_x',
      collection: 'data',
      user: '',
      password: '',
      connectionString: 'mongodb://localhost:27017',
      // Automated Neural Sync Defaults
      checkDuplicateKey: true,
      duplicateKeyField: 'id',
      duplicateAction: 'skip',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'top',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'memory' },
          ],
        },
      ],
    },
  } as NodeObjType
}
