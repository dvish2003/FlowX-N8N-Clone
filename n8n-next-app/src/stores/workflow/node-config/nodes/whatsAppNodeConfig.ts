import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function whatsAppNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'whatsAppNode',
    position,
    data: {
      label: label || 'WhatsApp',
      icon: icon || '/icons/whatsapp.png',
      accessToken: '',
      phoneNumberId: '',
      recipientPhone: '',
      message: ''
    },
  } as NodeObjType
}
