export type CollaboratorUser = {
  id: string;
  name: string;
  email: string;
};

export type Collaborator = {
  id: string;
  role: "OWNER" | "EDITOR";
  createdAt: string;
  user: CollaboratorUser;
};

export type InviteCollaboratorInput = {
  email: string;
};

export type GetCollaboratorsResponse = Collaborator[];

export type InviteCollaboratorResponse = Collaborator;
