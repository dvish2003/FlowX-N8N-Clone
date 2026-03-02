import { dbConnect } from '@/lib/mongodb/mongodb';
import { Workflow } from '@/models/workflowSchema';
import { calculateNextExecution } from '@/lib/workflow/executionEngine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, projectId, name, description, nodes, edges } = body;

    if (!userId || !projectId || !name || !nodes) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, projectId, name, nodes' },
        { status: 400 }
      );
    }

    const scheduleTrigger = nodes.find((n: any) => n.type === 'scheduleTriggerNode');
    const nextExecution = scheduleTrigger ? calculateNextExecution(scheduleTrigger.data) : null;

    const workflow = new Workflow({
      userId,
      projectId,
      name,
      description,
      nodes,
      edges,
      isActive: true,
      nextExecution,
    });

    await workflow.save();

    return NextResponse.json({
      success: true,
      workflow: workflow.toObject(),
      message: 'Workflow created successfully',
    });
  } catch (error: any) {
    console.error('[Workflow Creation Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { _id, nodes, edges, name, description, isActive } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (nodes) updateData.nodes = nodes;
    if (edges) updateData.edges = edges;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (nodes) {
      const scheduleTrigger = nodes.find((n: any) => n.type === 'scheduleTriggerNode');
      if (scheduleTrigger) {
        updateData.nextExecution = calculateNextExecution(scheduleTrigger.data);
      }
    }

    const workflow = await Workflow.findByIdAndUpdate(_id, updateData, { new: true });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workflow: workflow.toObject(),
      message: 'Workflow updated successfully',
    });
  } catch (error: any) {
    console.error('[Workflow Update Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows?projectId=xxx
 * Get all workflows for a project
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const workflows = await Workflow.find({ projectId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      workflows: workflows.map((w) => w.toObject()),
    });
  } catch (error: any) {
    console.error('[Workflows Fetch Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows
 * Delete a workflow
 */
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    const workflow = await Workflow.findByIdAndDelete(_id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    console.error('[Workflow Delete Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
