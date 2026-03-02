import { Workflow } from "@/models/workflowSchema";

export type ProjectTypeProps = {
  name: string;
  userId: string;
  status?: string;
  trigger?: string;
  updatedAt?: string;
};

export class ProjectService {
  private static instance: ProjectService;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async createProject(props: ProjectTypeProps) {
    console.log("📁 Creating industrial workflow entry for project:", props);
    const workflow = new Workflow({
      name: props.name,
      userId: props.userId,
      projectId: 'default',
      isActive: true,
      nodes: [],
      edges: []
    });
    const saved = await workflow.save();
    return saved.toObject();
  }

  async updateProjects(props: { id: string, name: string, userId: string, status?: string, trigger?: string }) {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: props.id, userId: props.userId },
      { name: props.name },
      { new: true, runValidators: true }
    );
    return workflow;
  }

  async getSingleProject(projectId: string) {
    const workflow = await Workflow.findById(projectId);
    return workflow;
  }

  async getAllProjects({
    search = "",
    page = 1,
    limit = 10,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } }
      ];
    }

    const [workflows, total] = await Promise.all([
      Workflow.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),
      Workflow.countDocuments(filter)
    ]);

    // Map Workflows to the "Project" structure expected by the UI
    const projects = workflows.map((wf: any) => ({
      ...wf,
      status: wf.isActive ? 'Active' : 'Inactive',
      trigger: wf.nodes?.some((n: any) => n.type === 'scheduleTriggerNode') ? 'Automated' : 'Manual trigger'
    }));

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}