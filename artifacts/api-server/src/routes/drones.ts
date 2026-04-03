import { Router } from "express";
import { db } from "@workspace/db";
import { droneBookingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const DRONE_OPERATORS = [
  {
    id: 1,
    name: "Ravi Kumar Drone Services",
    location: "Guntur, AP",
    distanceKm: 3.2,
    pricePerAcre: 650,
    rating: 4.8,
    available: true,
    droneModel: "DJI Agras T40",
    speciality: "Pesticide Spraying"
  },
  {
    id: 2,
    name: "Andhra Aerial Solutions",
    location: "Vijayawada, AP",
    distanceKm: 8.5,
    pricePerAcre: 580,
    rating: 4.6,
    available: true,
    droneModel: "XAG P100 Pro",
    speciality: "Fertilizer Application"
  },
  {
    id: 3,
    name: "Krishna Valley Drones",
    location: "Tenali, AP",
    distanceKm: 12.1,
    pricePerAcre: 720,
    rating: 4.9,
    available: false,
    droneModel: "DJI Agras T20P",
    speciality: "Seed Sowing & Spraying"
  },
  {
    id: 4,
    name: "TechFarm Drone Co.",
    location: "Narasaraopet, AP",
    distanceKm: 15.8,
    pricePerAcre: 550,
    rating: 4.4,
    available: true,
    droneModel: "Garuda Aerospace D2",
    speciality: "Large Field Coverage"
  },
  {
    id: 5,
    name: "Green Wings Agri-Drones",
    location: "Bapatla, AP",
    distanceKm: 22.3,
    pricePerAcre: 600,
    rating: 4.7,
    available: true,
    droneModel: "IdeaForge RYNO",
    speciality: "Organic Farming Support"
  }
];

router.get("/drones", (req, res) => {
  res.json(DRONE_OPERATORS);
});

router.get("/drones/bookings", async (req, res) => {
  try {
    const bookings = await db.select().from(droneBookingsTable).orderBy(desc(droneBookingsTable.bookedAt));
    res.json(bookings);
  } catch (err) {
    req.log.error({ err }, "Failed to get drone bookings");
    res.status(500).json({ error: "Failed to retrieve bookings" });
  }
});

router.post("/drones/bookings", async (req, res) => {
  const { operatorId, fieldSizeAcres, scheduledDate, pesticide, notes } = req.body;
  
  if (!operatorId || !fieldSizeAcres || !scheduledDate || !pesticide) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const operator = DRONE_OPERATORS.find(op => op.id === operatorId);
  if (!operator) {
    res.status(404).json({ error: "Drone operator not found" });
    return;
  }

  const totalCost = operator.pricePerAcre * fieldSizeAcres;

  try {
    const [booking] = await db.insert(droneBookingsTable).values({
      operatorName: operator.name,
      fieldSizeAcres,
      scheduledDate,
      pesticide,
      totalCost,
      status: "confirmed"
    }).returning();

    res.status(201).json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to create drone booking");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

export default router;
