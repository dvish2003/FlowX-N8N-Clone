import { projectListProps } from "../../components/project/ProjectList";
import { makeHttpsReq } from "../../helper/makeHttpsReq";

export type PaginationType = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProjectServerData = {
  projects: projectListProps[];
} & {
  pagination?: PaginationType;
};
export async function getProjects(
  page = 1,
  search = ""
): Promise<ProjectServerData> {
  const data = await makeHttpsReq(
    "GET",
    `projects?page=${page}&search=${search}`
  ) as ProjectServerData;
  return data;
}
