export type CreateWorkspaceInput = {
  name: string;
};

export type RenameWorkspaceInput = {
  name: string;
};

export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

/** tldraw TLEditorSnapshot as a plain JSON object */
export type WorkspaceSnapshotPayload = Record<string, unknown>;

export type WorkspaceSnapshotData = {
  snapshot: WorkspaceSnapshotPayload | null;
};

export type CreateWorkspaceResponse = {
  success: true;
  data: Workspace;
};

export type RenameWorkspaceResponse = {
  success: true;
  data: Workspace;
};

export type GetWorkspacesResponse = {
  success: true;
  data: Workspace[];
};

export type GetWorkspaceResponse = {
  success: true;
  data: Workspace;
};

export type GetWorkspaceSnapshotResponse = {
  success: true;
  data: WorkspaceSnapshotData;
};

export type SaveWorkspaceSnapshotResponse = {
  success: true;
  data: WorkspaceSnapshotData;
};

export type DeleteWorkspaceResponse = {
  success: true;
  message: string;
};
