import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function webhookNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'webhookNode',
    position,
    data: {
      label: label || 'Webhook',
      icon: icon || '/icons/http.png',
      webhookPath: id,
      method: 'POST',
      responseMode: 'onReceived'
    },
  } as NodeObjType
}
