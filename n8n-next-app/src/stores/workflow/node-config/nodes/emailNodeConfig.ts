import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function emailNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'emailNode',
    position,
    data: {
      label: label || 'Email (SMTP)',
      icon: icon || '/icons/message.png',
      host: '',
      port: 587,
      secure: true,
      auth: { user: '', pass: '' },
      from: '',
      to: '',
      subject: '',
      body: '',
      isHtml: false
    },
  } as NodeObjType
}
