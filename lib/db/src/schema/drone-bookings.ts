import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const droneBookingsTable = pgTable("drone_bookings", {
  id: serial("id").primaryKey(),
  operatorName: text("operator_name").notNull(),
  fieldSizeAcres: real("field_size_acres").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  pesticide: text("pesticide").notNull(),
  totalCost: real("total_cost").notNull(),
  status: text("status").notNull().default("pending"),
  bookedAt: timestamp("booked_at").defaultNow().notNull(),
});

export const insertDroneBookingSchema = createInsertSchema(droneBookingsTable).omit({ id: true, bookedAt: true });
export type InsertDroneBooking = z.infer<typeof insertDroneBookingSchema>;
export type DroneBooking = typeof droneBookingsTable.$inferSelect;
