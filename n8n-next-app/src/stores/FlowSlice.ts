import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
} from "@xyflow/react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

import type {
  NodeObjType,
} from "./workflow/node-config/nodes/types/node-types";
import {
  agentNodeConfig,
  calendarNodeConfig,
  vectordbNodeConfig,
  embeddingModelNodeConfig,
  discordNodeConfig,
  notionNodeConfig,
  driveNodeConfig,
  slackNodeConfig,
  gmailNodeConfig,
  modelNodeConfig,
  toolNodeConfig,
  inputNodeConfig,
  outputNodeConfig,
  subAgentNodeConfig,
  scheduleTriggerNodeConfig,
  httpNodeConfig,
  chatTriggerNodeConfig,
  retrieverNodeConfig,
  sendDataNodeConfig,
  groqNodeConfig,
  mongoDBNodeConfig,
  googleSheetNodeConfig,
  ifNodeConfig,
  switchNodeConfig,
  delayNodeConfig,
  emailNodeConfig,
  telegramNodeConfig,
  webhookNodeConfig,
  dataFormatterNodeConfig,
  codeNodeConfig,
  loopNodeConfig,
  errorHandlerNodeConfig,
  whatsAppNodeConfig,
  csvLoaderNodeConfig,
  pdfConverterNodeConfig
} from "./workflow/node-config";


interface FlowLog {
  id: string;
  type: "connect" | "info" | "error" | "success";
  message: string;
  timestamp: string;
  nodeId?: string;
  data?: any;
}

interface FlowState {
  nodes: NodeObjType[];
  edges: Edge[];
  selectedNode: NodeObjType | null;
  idCount: number;
  executionTree: unknown[];
  logs: FlowLog[];
  showToolsPanel: boolean;
  isRunning: boolean;
  isSchedulerActive: boolean;
  showConsole: boolean;
}

const initialState: FlowState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  idCount: 1,
  executionTree: [],
  logs: [],
  showToolsPanel: false,
  isRunning: false,
  isSchedulerActive: false,
  showConsole: false,
};

const flowSlice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<NodeObjType[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    onNodesChange: (state, action: PayloadAction<any>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes as any) as any;
    },
    onEdgesChange: (state, action: PayloadAction<any>) => {
      state.edges = applyEdgeChanges(action.payload, state.edges) as any;
    },
    onConnect: (state, action: PayloadAction<Connection>) => {
      // Prevent duplicate edges
      const isDuplicate = state.edges.some(e => 
        e.source === action.payload.source && 
        e.target === action.payload.target && 
        e.sourceHandle === action.payload.sourceHandle && 
        e.targetHandle === action.payload.targetHandle
      );
      if (isDuplicate) return;

      state.edges = addEdge(action.payload, state.edges);
      const { source, target, sourceHandle, targetHandle } = action.payload;
      const sourceNode = state.nodes.find((node) => node.id === source);
      const targetNode = state.nodes.find((node) => node.id === target);
      const log: FlowLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "connect",
        message: `Connected ${source ?? "unknown"} → ${target ?? "unknown"}`,
        timestamp: new Date().toISOString(),
        data: {
          source,
          target,
          sourceHandle,
          targetHandle,
          sourceNode: sourceNode
            ? {
                nodeName: sourceNode.data?.label ?? sourceNode.type,
                type: sourceNode.type,
                config: { ...(sourceNode.data ?? {}) },
                children: [],
              }
            : null,
          targetNode: targetNode
            ? {
                nodeName: targetNode.data?.label ?? targetNode.type,
                type: targetNode.type,
                config: { ...(targetNode.data ?? {}) },
                children: [],
              }
            : null,
        },
      };
      state.logs.unshift(log);
    },
    setSelectedNode: (state, action: PayloadAction<NodeObjType | null>) => {
      state.selectedNode = action.payload;
    },
    addNode: (
      state,
      action: PayloadAction<{
        node: string;
        icon: string;
        label: string;
      }>
    ) => {
      const {icon,label} = action.payload;
      let idCount = state.idCount;
      let id = `node-${idCount}`;
      
      // Safeguard: Ensure ID is actually unique in current state
      while (state.nodes.some(n => n.id === id)) {
        idCount++;
        id = `node-${idCount}`;
      }
      
      let newNode: NodeObjType;
      const position = { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 };
      
      state.idCount = idCount; // Update persistent counter

     if (action.payload.node === "agent") {
        newNode = agentNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "tool") {
        newNode = toolNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "inputNode") {
        newNode = inputNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "embeddingModelNode") {
        newNode = embeddingModelNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "outputNode") {
        newNode = outputNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "calendarNode") {
        newNode = calendarNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "discordNode") {
        newNode = discordNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "notionNode") {
        newNode = notionNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "driveNode") {
        newNode = driveNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "slackNode") {
        newNode = slackNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "gmailNode") {
        newNode = gmailNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "modelNode") {
        newNode = modelNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "subAgent") {
        newNode = subAgentNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "vectordbNode") {
        newNode = vectordbNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "scheduleTriggerNode") {
        newNode = scheduleTriggerNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "httpNode") {
        newNode = httpNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "chatTriggerNode") {
        newNode = chatTriggerNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "retrieverNode") {
        newNode = retrieverNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "sendDataNode") {
        newNode = sendDataNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "groqNode") {
        newNode = groqNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "mongoDBNode") {
        newNode = mongoDBNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "googleSheetNode") {
        newNode = googleSheetNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "ifNode") {
        newNode = ifNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "switchNode") {
        newNode = switchNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "delayNode") {
        newNode = delayNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "emailNode") {
        newNode = emailNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "telegramNode") {
        newNode = telegramNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "webhookNode") {
        newNode = webhookNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "dataFormatterNode") {
        newNode = dataFormatterNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "codeNode") {
        newNode = codeNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "loopNode") {
        newNode = loopNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "errorHandlerNode") {
        newNode = errorHandlerNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "whatsAppNode") {
        newNode = whatsAppNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "csvLoaderNode") {
        newNode = csvLoaderNodeConfig({ id, label, icon, position });
      } else if (action.payload.node === "pdfConverterNode") {
        newNode = pdfConverterNodeConfig({ id, label, icon, position });
      } else {

        return;
      }

      state.nodes.push(newNode);
      state.idCount += 1;
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((node: NodeObjType) => node.id !== action.payload);
      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== action.payload && edge.target !== action.payload
      );
    },
    updateNode: (
      state,
      action: PayloadAction<{ id: string; data: Partial<NodeObjType> }>
    ) => {
      const { id, data } = action.payload;
      const nodeIndex = state.nodes.findIndex((node: NodeObjType) => node.id === id);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...data } as NodeObjType;
      }
    },
    updateNodeData: (
      state,
      action: PayloadAction<{ nodeId: string; data: Record<string, unknown> }>
    ) => {
      const { nodeId, data } = action.payload;
      const nodeIndex = state.nodes.findIndex((node: NodeObjType) => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex].data = { ...state.nodes[nodeIndex].data, ...data };
        if (state.selectedNode?.id === nodeId) {
          state.selectedNode.data = { ...state.selectedNode.data, ...data };
        }
      }
    },
    setShowToolsPanel: (state, action: PayloadAction<boolean>) => {
      state.showToolsPanel = action.payload;
    },
    addLog: (state, action: PayloadAction<Omit<FlowLog, "id" | "timestamp">>) => {
      const log: FlowLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.logs.unshift(log);
      state.showConsole = true;
    },
    setLogs: (state, action: PayloadAction<FlowLog[]>) => {
        state.logs = action.payload;
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setIsSchedulerActive: (state, action: PayloadAction<boolean>) => {
      state.isSchedulerActive = action.payload;
    },
    toggleShowConsole: (state) => {
      state.showConsole = !state.showConsole;
    },
    setShowConsole: (state, action: PayloadAction<boolean>) => {
      state.showConsole = action.payload;
    },
    syncIdCount: (state) => {
      const maxId = state.nodes.reduce((max, node) => {
        const idParts = node.id.split('-');
        const idNum = parseInt(idParts[idParts.length - 1]);
        return isNaN(idNum) ? max : Math.max(max, idNum);
      }, 0);
      state.idCount = maxId + 1;
    },
  },
});

export const {
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setSelectedNode,
  addNode,
  deleteNode,
  updateNodeData,
  setShowToolsPanel,
  addLog,
  setLogs,
  clearLogs,
  setIsRunning,
  setIsSchedulerActive,
  toggleShowConsole,
  setShowConsole,
  syncIdCount,
} = flowSlice.actions;

export default flowSlice.reducer;
