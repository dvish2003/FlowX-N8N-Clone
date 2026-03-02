import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function telegramNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  return {
    id,
    type: 'telegramNode',
    position,
    data: {
      label: label || 'Telegram',
      icon: icon || '/icons/bot.png',
      botToken: '',
      chatId: '',
      message: ''
    },
  } as NodeObjType
}
