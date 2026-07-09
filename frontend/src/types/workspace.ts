export type CreateWorkspaceInput = {
  name: string;
};

export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceResponse = {
  success: true;
  data: Workspace;
};

export type GetWorkspacesResponse = {
  success: true;
  data: Workspace[];
};
