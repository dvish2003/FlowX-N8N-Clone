import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb/mongodb';
import { Workflow } from '@/models/workflowSchema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id || session.user.email;
    const workflows = await Workflow.find({ userId }).sort({ updatedAt: -1 });
    
    return NextResponse.json({ success: true, workflows });
  } catch (error: any) {
    console.error('[Workflow List Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
