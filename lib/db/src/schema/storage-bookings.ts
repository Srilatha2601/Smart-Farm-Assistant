import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storageBookingsTable = pgTable("storage_bookings", {
  id: serial("id").primaryKey(),
  storageName: text("storage_name").notNull(),
  quantityTons: real("quantity_tons").notNull(),
  startDate: text("start_date").notNull(),
  durationDays: integer("duration_days").notNull(),
  cropType: text("crop_type").notNull(),
  totalCost: real("total_cost").notNull(),
  status: text("status").notNull().default("pending"),
  bookedAt: timestamp("booked_at").defaultNow().notNull(),
});

export const insertStorageBookingSchema = createInsertSchema(storageBookingsTable).omit({ id: true, bookedAt: true });
export type InsertStorageBooking = z.infer<typeof insertStorageBookingSchema>;
export type StorageBooking = typeof storageBookingsTable.$inferSelect;
