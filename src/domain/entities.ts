export type EntityBase = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Consultation = EntityBase & {
  humanId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  responsibleUserId: string;
};

export type Client = EntityBase & {
  humanId: string;
  displayName: string;
  status: string;
  responsibleUserId: string;
  sourceConsultationId: string | null;
};

export type LegalCase = EntityBase & {
  humanId: string;
  clientId: string;
  title: string;
  status: string;
  responsibleUserId: string;
  assignedUserIds: string[];
};

export type Note = EntityBase & {
  authorUid: string;
  body: string;
  consultationId: string | null;
  clientId: string | null;
  caseId: string | null;
};

export type LegalDocument = EntityBase & {
  caseId: string | null;
  clientId: string | null;
  categoryId: string | null;
  name: string;
  mimeType: string;
  size: number;
  status: string;
  createdBy: string;
};

export type LegalTask = EntityBase & {
  title: string;
  status: string;
  assignedTo: string;
  caseId: string | null;
  dueAt: Date | null;
};

export type LegalEvent = EntityBase & {
  title: string;
  startsAt: Date;
  endsAt: Date | null;
  responsibleUserId: string;
  caseId: string | null;
};

export type RoleDefinition = {
  key: string;
  name: string;
  permissionKeys: string[];
  version: number;
};
