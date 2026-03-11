export interface IStorage {
  // Invite operations are handled in server/invites.ts
  // This keeps storage focused on data access while invites.ts handles business logic
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
