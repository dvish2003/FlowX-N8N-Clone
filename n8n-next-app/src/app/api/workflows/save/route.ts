import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb/mongodb';
import { Workflow } from '@/models/workflowSchema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { id, name, nodes, edges, projectId, isActive, lastExecuted, nextExecution } = body;
    
    const rawNodes = Array.isArray(nodes) ? nodes : [];
    const rawEdges = Array.isArray(edges) ? edges : [];

    const userId = (session.user as any).id || session.user.email;

    console.log(`[Industrial Save] Processing sequence for "${name}" | User: ${userId} | Active: ${isActive} | LastExec: ${lastExecuted}`);
    
    const mappedNodes = rawNodes.map((node: any) => {
        return {
            id: node.id || `node-${Math.random()}`,
            type: node.type || 'unknown',
            data: { ...(node.data || node.config || {}) },
            position: node.position || { x: 0, y: 0 }
        };
    });

    const mappedEdges = rawEdges.map((edge: any) => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || 'output',
      targetHandle: edge.targetHandle || 'input'
    }));

    let workflow;
    if (id) {
      workflow = await Workflow.findOneAndUpdate(
        { _id: id, userId },
        { 
          name, 
          nodes: mappedNodes, 
          edges: mappedEdges, 
          projectId: projectId || 'default',
          isActive: isActive !== undefined ? isActive : true,
          lastExecuted: lastExecuted ? new Date(lastExecuted) : undefined,
          nextExecution: nextExecution ? new Date(nextExecution) : undefined
        },
        { new: true }
      );
      
      if (!workflow) {
          return NextResponse.json({ error: 'Workflow not found or access denied' }, { status: 404 });
      }
    } else {
      workflow = await Workflow.create({
        name,
        nodes: mappedNodes,
        edges: mappedEdges,
        projectId: projectId || 'default',
        userId,
        isActive: isActive !== undefined ? isActive : true,
        lastExecuted: lastExecuted ? new Date(lastExecuted) : undefined,
        nextExecution: nextExecution ? new Date(nextExecution) : undefined
      });
    }

    return NextResponse.json({ success: true, workflow });
  } catch (error: any) {
    console.error('[Workflow Save Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
