import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb/mongodb';
import { Workflow } from '@/models/workflowSchema';

type Params = {
  id: string;
};

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const workflow = await Workflow.findById(id);
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, workflow });
  } catch (error: any) {
    console.error('[Workflow Get Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
