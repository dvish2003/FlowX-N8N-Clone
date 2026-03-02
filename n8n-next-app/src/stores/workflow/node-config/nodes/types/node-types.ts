export interface NodeHandle {
  name: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  type: 'target' | 'source'
  LinkTo?: Array<{ nodeName: string; handlePosition: string }> | never[]
}

export interface NodeConstraint {
  nodeHandles: NodeHandle[]
}

export interface NodeConfigProps {
  id: string
  label?: string
  icon?: string
  position: { x: number; y: number }
}

export interface NodeObjType {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
  constraints?: NodeConstraint
  category?: string
}
