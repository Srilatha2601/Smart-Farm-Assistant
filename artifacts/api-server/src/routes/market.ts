import { Router } from "express";

const router = Router();

const MARKET_DEALS = [
  {
    id: 1,
    company: "Lays (PepsiCo India)",
    logo: "🥔",
    cropType: "Potato",
    quantityTons: 500,
    pricePerKg: 18.5,
    deadline: "2026-04-30",
    requirements: "Grade A, moisture <14%, no blemishes. Preferred variety: Kufri Chipsona",
    location: "Guntur, AP",
    isUrgent: true,
    interestedCount: 23
  },
  {
    id: 2,
    company: "Britannia Industries",
    logo: "🌾",
    cropType: "Wheat",
    quantityTons: 2000,
    pricePerKg: 24.0,
    deadline: "2026-05-15",
    requirements: "Hard wheat, protein >11%, gluten strength high. Rajasthan/AP origin preferred",
    location: "Hyderabad (pickup)",
    isUrgent: false,
    interestedCount: 45
  },
  {
    id: 3,
    company: "ITC Agri",
    logo: "🌿",
    cropType: "Chilli",
    quantityTons: 300,
    pricePerKg: 85.0,
    deadline: "2026-04-25",
    requirements: "Teja variety, capsaicin >1%, dry weight. Guntur Sannam accepted",
    location: "Guntur, AP",
    isUrgent: true,
    interestedCount: 67
  },
  {
    id: 4,
    company: "Amul (GCMMF)",
    logo: "🌺",
    cropType: "Turmeric",
    quantityTons: 150,
    pricePerKg: 120.0,
    deadline: "2026-05-20",
    requirements: "Curcumin >3.5%, Alleppey or Erode variety accepted. Organic certification preferred",
    location: "Nizamabad (pickup)",
    isUrgent: false,
    interestedCount: 31
  },
  {
    id: 5,
    company: "MTR Foods",
    logo: "🍚",
    cropType: "Rice (Basmati)",
    quantityTons: 800,
    pricePerKg: 52.0,
    deadline: "2026-06-01",
    requirements: "1121 or Pusa Basmati variety, average grain length >8mm, moisture <12%",
    location: "West Godavari, AP",
    isUrgent: false,
    interestedCount: 89
  },
  {
    id: 6,
    company: "Adani Wilmar",
    logo: "🌻",
    cropType: "Sunflower Seeds",
    quantityTons: 1000,
    pricePerKg: 45.0,
    deadline: "2026-04-28",
    requirements: "Oil content >42%, moisture <8%, foreign matter <1%. Cleaned and dried",
    location: "Kurnool, AP",
    isUrgent: true,
    interestedCount: 42
  }
];

const interests: Record<number, number> = {};

router.get("/market/deals", (req, res) => {
  const deals = MARKET_DEALS.map(deal => ({
    ...deal,
    interestedCount: deal.interestedCount + (interests[deal.id] || 0)
  }));
  res.json(deals);
});

router.post("/market/deals/:id/express-interest", (req, res) => {
  const id = parseInt(req.params.id);
  const deal = MARKET_DEALS.find(d => d.id === id);
  
  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  
  interests[id] = (interests[id] || 0) + 1;
  
  res.json({
    success: true,
    message: `Your interest in the ${deal.company} deal has been registered. They will contact you within 24 hours.`
  });
});

export default router;
