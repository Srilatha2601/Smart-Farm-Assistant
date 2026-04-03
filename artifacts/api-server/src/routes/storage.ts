import { Router } from "express";
import { db } from "@workspace/db";
import { storageBookingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const COLD_STORAGES = [
  {
    id: 1,
    name: "Guntur Cold Storage Ltd",
    location: "Guntur City, AP",
    distanceKm: 4.2,
    pricePerDayTon: 18,
    capacityTons: 5000,
    availableSlots: 2300,
    temperature: "-18°C to 4°C",
    rating: 4.7,
    features: ["24/7 Monitoring", "Loading Dock", "Insurance Cover", "Online Tracking"]
  },
  {
    id: 2,
    name: "AP Agri Warehouse Complex",
    location: "Mangalagiri, AP",
    distanceKm: 9.8,
    pricePerDayTon: 14,
    capacityTons: 8000,
    availableSlots: 4100,
    temperature: "4°C to 15°C",
    rating: 4.5,
    features: ["Humidity Control", "Pest Control", "Insurance Cover", "Government Certified"]
  },
  {
    id: 3,
    name: "Krishna Refrigerated Stores",
    location: "Vijayawada, AP",
    distanceKm: 16.4,
    pricePerDayTon: 22,
    capacityTons: 3000,
    availableSlots: 800,
    temperature: "-25°C to 0°C",
    rating: 4.9,
    features: ["Premium Handling", "24/7 Security", "Quick Loading", "Export Quality"]
  },
  {
    id: 4,
    name: "Nagarjuna Cold Chain Hub",
    location: "Tenali, AP",
    distanceKm: 24.7,
    pricePerDayTon: 12,
    capacityTons: 12000,
    availableSlots: 6500,
    temperature: "0°C to 10°C",
    rating: 4.3,
    features: ["Low Cost", "Large Capacity", "Government Subsidy", "Long Term Storage"]
  }
];

router.get("/storage", (req, res) => {
  res.json(COLD_STORAGES);
});

router.post("/storage/bookings", async (req, res) => {
  const { storageId, quantityTons, startDate, durationDays, cropType } = req.body;
  
  if (!storageId || !quantityTons || !startDate || !durationDays || !cropType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const storage = COLD_STORAGES.find(s => s.id === storageId);
  if (!storage) {
    res.status(404).json({ error: "Storage facility not found" });
    return;
  }

  if (quantityTons > storage.availableSlots) {
    res.status(400).json({ error: "Insufficient storage capacity" });
    return;
  }

  const totalCost = storage.pricePerDayTon * quantityTons * durationDays;

  try {
    const [booking] = await db.insert(storageBookingsTable).values({
      storageName: storage.name,
      quantityTons,
      startDate,
      durationDays,
      cropType,
      totalCost,
      status: "confirmed"
    }).returning();

    res.status(201).json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to create storage booking");
    res.status(500).json({ error: "Failed to create storage booking" });
  }
});

export default router;
