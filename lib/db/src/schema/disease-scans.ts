import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diseaseScansTable = pgTable("disease_scans", {
  id: serial("id").primaryKey(),
  diseaseName: text("disease_name").notNull(),
  confidence: real("confidence").notNull(),
  severity: text("severity").notNull(),
  cropType: text("crop_type").notNull().default("unknown"),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export const insertDiseaseScanSchema = createInsertSchema(diseaseScansTable).omit({ id: true, scannedAt: true });
export type InsertDiseaseScan = z.infer<typeof insertDiseaseScanSchema>;
export type DiseaseScan = typeof diseaseScansTable.$inferSelect;
