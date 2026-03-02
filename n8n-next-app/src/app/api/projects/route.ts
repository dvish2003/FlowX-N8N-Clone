import { withAuth } from "@/lib/mongodb/withAuth";
import { withErrorHandler } from "@/lib/mongodb/withErrorHandler";
import { ProjectService } from "@/services/project/ProjectService";
import { NextResponse } from "next/server";

export const POST = withAuth(async (request: Request) => {
    const req = request as Request;
    const {name,userId} = await req.json();
    const projectService = ProjectService.getInstance();
    const newProject = await projectService.createProject({name,userId});
    return NextResponse.json({message:"Project Created",newProject});
})


export const GET = withAuth(async (request: Request) => {
    const req = request as Request;
    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1',10);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10',10);

    const projectService = ProjectService.getInstance();
    const projectsData = await projectService.getAllProjects({search,page,limit});
    return NextResponse.json(projectsData);
})


export const PUT = withAuth(async (request: Request) => {
    const req = request as Request;
    const { id, name, userId, status, trigger } = await req.json();

    const projectService = ProjectService.getInstance();
    const updatedProject = await projectService.updateProjects({ id, name, userId, status, trigger });

    if (!updatedProject) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project Updated", project: updatedProject });
})