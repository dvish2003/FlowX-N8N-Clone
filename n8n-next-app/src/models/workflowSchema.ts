import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduleTrigger {
  triggerInterval: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'custom';
  customSeconds?: number;
  customMinutes?: number;
  customHours?: number;
  daysBetween?: number;
  monthsBetween?: number;
  triggerOnDay?: number;
  triggerAtHour?: string;
  triggerAtMinute?: string;
  triggerAtSecond?: string;
  executionMode: 'auto' | 'manual';
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  onError?: string;
}

export interface IHTTPRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  sendQueryParams?: boolean;
  sendHeaders?: boolean;
  sendBody?: boolean;
  authentication: 'none' | 'basic' | 'bearer' | 'apikey';
  basicAuth?: { username: string; password: string };
  bearerToken?: string;
  apiKey?: { key: string; value: string };
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  timeoutSeconds: number;
  sslCertificates?: boolean;
  retries: number;
  followRedirects?: boolean;
  executionMode: 'auto' | 'manual';
}

export interface IWorkflow extends Document {
  userId: string;
  projectId: string;
  name: string;
  description?: string;
  nodes: {
    id: string;
    type: string;
    data: any;
    position?: {
        x: number;
        y: number;
    };
  }[];
  edges: {
    source: string;
    target: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export interface IExecution extends Document {
  workflowId: string;
  triggerType: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  nodeExecutions: {
    nodeId: string;
    nodeType: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    input?: Record<string, any>;
    output?: Record<string, any>;
    error?: string;
    startTime: Date;
    endTime?: Date;
  }[];
  error?: string;
  logs?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    }
}, { _id: false, strict: false });

const EdgeSchema = new Schema({
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: String,
    targetHandle: String
}, { _id: false });

const WorkflowSchema = new Schema<IWorkflow>(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    nodes: { type: [NodeSchema], default: [] },
    edges: { type: [EdgeSchema], default: [] },
    isActive: { type: Boolean, default: true },
    lastExecuted: Date,
    nextExecution: Date,
  },
  { timestamps: true, strict: false }
);

const ExecutionSchema = new Schema<IExecution>(
  {
    workflowId: { type: String, required: true, index: true },
    triggerType: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
    },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    duration: Number,
    nodeExecutions: [
      {
        nodeId: String,
        nodeType: String,
        status: String,
        input: Schema.Types.Mixed,
        output: Schema.Types.Mixed,
        error: String,
        startTime: Date,
        endTime: Date,
      },
    ],
    error: String,
    logs: [String],
  },
  { timestamps: true }
);

if (mongoose.models.Workflow) delete mongoose.models.Workflow;
if (mongoose.models.Execution) delete mongoose.models.Execution;

export const Workflow = mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
export const Execution = mongoose.model<IExecution>('Execution', ExecutionSchema);
