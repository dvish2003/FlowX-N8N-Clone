import { dbConnect } from '@/lib/mongodb/mongodb';
import { Workflow, Execution } from '@/models/workflowSchema';
import { executeWorkflowAsync } from '@/lib/workflow/scheduler';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await params;

    const workflow = await Workflow.findById(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    console.log(`[API] Manual execution requested for workflow: ${id}`);
    
    // Execute the workflow and set it to active
    await Workflow.findByIdAndUpdate(id, { isActive: true });
    await executeWorkflowAsync(id);

    // Fetch the execution record that was just created
    // We assume the most recent one is ours.
    const execution = await Execution.findOne({ workflowId: id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      execution: execution?.toObject(),
      message: `Workflow executed successfully`,
    });
  } catch (error: any) {
    console.error('[Workflow Execution Error]', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows/[id]/executions
 * Get execution history
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await params;

    const executions = await Execution.find({ workflowId: id })
      .sort({ createdAt: -1 })
      .limit(50);

    const workflow = await Workflow.findById(id);

    return NextResponse.json({
      success: true,
      workflow: workflow?.toObject(),
      executions: executions.map((e: any) => e.toObject()),
      nextExecution: workflow?.nextExecution,
    });
  } catch (error: any) {
    console.error('[Workflow History Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
