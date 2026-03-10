export interface IStorage {
  // Kept empty for now as per "Do not add database logic yet"
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
