import type { RentalListing } from "./rentalModels";

// The fleet as seeded by car-auction-app-backend (migrations/0008_rentals.sql), shown
// while the API loads or when it can't be reached. Ids equal slugs here; real bookings
// always use the listing the API returns.

const VEHICLE_PERKS = ["Cleaned before every trip", "Driver included", "Full tank, no extra", "1 free stop"];
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1280&q=70&auto=format&fit=crop`;

const vehicle = (l: Omit<RentalListing, "id" | "kind" | "perks" | "crewRole" | "base" | "minHours" | "highlight" | "meta">): RentalListing => ({
  ...l,
  id: l.slug,
  kind: "vehicle",
  highlight: "Fresh · driver",
  meta: "Island & outskirts · Interstate",
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
    badge: "new",
    images: [u("1641333326784-24a9c21d3c4e")],
    rates: { airport: { island: 170000, outskirts: 200000 }, h6: { island: 220000, outskirts: 270000 }, h12: { island: 320000, outskirts: 370000 }, h24: { island: 570000, outskirts: 670000, interstate: 700000 } },
  }),
  vehicle({
    slug: "toyota-land-cruiser",
    name: "Toyota Land Cruiser",
    shortName: "Land Cruiser",
    tag: "SUV · 7 seats",
    specs: "SUV · 7 seats",
    badge: null,
    images: [u("1650530579355-7ad9d4766043")],
    rates: { airport: { island: 170000, outskirts: 220000 }, h6: { island: 200000, outskirts: 250000 }, h12: { island: 270000, outskirts: 320000 }, h24: { island: 370000, outskirts: 420000, interstate: 450000 } },
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
