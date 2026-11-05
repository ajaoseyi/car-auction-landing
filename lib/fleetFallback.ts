import type { RentalListing } from "./rentalModels";

// The fleet and its Dec 2026 rate card (Carlot_Rental_Rates_Dec2026.pdf), shown
// while the API loads or when it can't be reached. Ids equal slugs here; real bookings
// always use the listing the API returns.

const VEHICLE_PERKS = ["Cleaned before every trip", "Driver included", "Full tank, no extra", "1 free stop"];
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1280&q=70&auto=format&fit=crop`;

const vehicle = (l: Omit<RentalListing, "id" | "kind" | "perks" | "crewRole" | "base" | "minHours" | "highlight" | "meta"> & { meta?: string }): RentalListing => ({
  highlight: "Fresh · driver",
  meta: "Island & outskirts · Interstate",
  ...l,
  id: l.slug,
  kind: "vehicle",
  perks: VEHICLE_PERKS,
  crewRole: "Chauffeur",
  base: null,
  minHours: 1,
});

const boat = (l: Omit<RentalListing, "id" | "kind" | "crewRole">): RentalListing => ({ ...l, id: l.slug, kind: "boat", crewRole: "Captain" });

export const FALLBACK_FLEET: RentalListing[] = [
  vehicle({
    slug: "toyota-prado-txl",
    name: "Toyota Land Cruiser Prado TX-L",
    shortName: "Prado",
    tag: "SUV · 7 seats",
    specs: "SUV · 7 seats · Black · TX-L",
    badge: "hot",
    images: ["prado-front", "prado-side", "prado-rear34", "prado-rear", "prado-front-seats", "prado-rear-seats"].map((n) => `/rentals/${n}.jpeg`),
    rates: { airport: { island: 120000, outskirts: 170000 }, h6: { island: 120000, outskirts: 170000 }, h12: { island: 170000, outskirts: 220000 }, h24: { island: 270000, outskirts: 320000, interstate: 350000 } },
  }),
  vehicle({
    slug: "toyota-hilux",
    name: "Toyota Hilux",
    shortName: "Hilux",
    tag: "Pickup · 5 seats",
    specs: "Pickup · 5 seats · Double cab",
    badge: null,
    images: ["/rentals/toyota-hilux-front34.jpeg"],
    rates: { airport: { island: 170000, outskirts: 220000 }, h6: { island: 170000, outskirts: 220000 }, h12: { island: 240000, outskirts: 440000 }, h24: { island: 580000, outskirts: 680000, interstate: 780000 } },
  }),
  vehicle({
    slug: "lexus-gx460",
    name: "Lexus GX460",
    shortName: "GX460",
    tag: "SUV · 7 seats",
    specs: "SUV · 7 seats · Luxury",
    badge: "new",
    meta: "Island & outskirts · Interstate on request",
    images: ["front34", "front", "side", "rear", "cabin", "rear-seats"].map((n) => `/rentals/lexus-gx460-${n}.jpeg`),
    rates: { airport: { island: 170000, outskirts: 230000 }, h6: { island: 170000, outskirts: 230000 }, h12: { island: 230000, outskirts: 340000 }, h24: { island: 400000, outskirts: 460000, interstate: null } },
  }),
  vehicle({
    slug: "cadillac-escalade",
    name: "Cadillac Escalade",
    shortName: "Escalade",
    tag: "SUV · 7 seats",
    specs: "SUV · 7 seats · Captain chairs",
    badge: "new",
    meta: "Island & outskirts · Interstate on request",
    images: ["front", "front34", "rear-seats", "captain"].map((n) => `/rentals/cadillac-escalade-${n}.jpeg`),
    rates: { airport: { island: 690000, outskirts: 790000 }, h6: { island: 690000, outskirts: 790000 }, h12: { island: 920000, outskirts: 1040000 }, h24: { island: 1610000, outskirts: 1840000, interstate: null } },
  }),
  vehicle({
    slug: "lexus-lx600",
    name: "Lexus LX600",
    shortName: "LX600",
    tag: "SUV · 7 seats",
    specs: "SUV · 7 seats · Flagship",
    badge: "new",
    meta: "Island & outskirts · Interstate on request",
    images: ["/lexus-lx600-sm.jpg"],
    rates: { airport: { island: 790000, outskirts: 890000 }, h6: { island: 790000, outskirts: 890000 }, h12: { island: 1150000, outskirts: 1380000 }, h24: { island: 1840000, outskirts: 2070000, interstate: null } },
  }),
  boat({
    slug: "azimut-42-flybridge",
    name: "Azimut 42 Flybridge",
    shortName: "Azimut 42",
    tag: "Yacht · 12 guests",
    highlight: "Captain & crew",
    meta: "Lekki Jetty · Min. 2 hrs",
    specs: "Yacht · 12 guests · Flybridge",
    badge: "hot",
    images: [u("1567899378494-47b22a2ae96a")],
    perks: ["Captain & crew", "Fuel for the route", "Life jackets on board", "Cleaned before every trip"],
    base: "Lekki Jetty, Pier 2",
    minHours: 2,
    rates: { h2: 1500000, h3: 2100000, h4: 2600000, day: 4800000 },
  }),
  boat({
    slug: "sea-ray-280-slx",
    name: "Sea Ray 280 SLX",
    shortName: "Sea Ray",
    tag: "Speedboat · 8 guests",
    highlight: "Captain included",
    meta: "Ikoyi Marina · Min. 2 hrs",
    specs: "Speedboat · 8 guests",
    badge: null,
    images: [u("1604737637145-48cc31d160eb")],
    perks: ["Captain included", "Fuel for the route", "Life jackets on board", "Cleaned before every trip"],
    base: "Ikoyi Marina",
    minHours: 2,
    rates: { h2: 350000, h3: 500000, h4: 640000, day: 1200000 },
  }),
  boat({
    slug: "princess-52-cruiser",
    name: "Princess 52 Cruiser",
    shortName: "Princess 52",
    tag: "Cruiser · 15 guests",
    highlight: "Captain & crew",
    meta: "Victoria Island · Min. 3 hrs",
    specs: "Cruiser · 15 guests",
    badge: "new",
    images: [u("1562281302-809108fd533c")],
    perks: ["Captain & crew", "Fuel for the route", "Life jackets on board", "Cleaned before every trip"],
    base: "Victoria Island Marina",
    minHours: 3,
    rates: { h2: null, h3: 2700000, h4: 3400000, day: 6200000 },
  }),
];
