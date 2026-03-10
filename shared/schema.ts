import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are keeping this file minimal as requested: "Do not add database logic yet"
export const dummy = pgTable("dummy", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});
