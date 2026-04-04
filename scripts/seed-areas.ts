import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HANDLED_AREAS = [
  "Ilocos",
  "Batanes / Cagayan / Isabela / Nueva Vizcaya / Quirino",
  "Baguio / La Union / Pangasinan",
  "Nueva Ecija / Aurora",
  "Bataan / Zambales",
  "Tarlac",
  "Pampanga",
  "Caloocan / Valenzuela / Malabon / Navotas",
  "Quezon City / Marikina",
  "Makati / Pasay",
  "San Juan / Mandaluyong / Pasig",
  "Las Piñas / Muntinlupa / Parañaque",
  "Taguig",
  "Manila City",
  "Rizal",
  "Cavite",
  "Laguna",
  "Batangas",
  "Quezon Province",
  "MIMAROPA",
  "Region V (Bicol)",
  "Aklan / Antique / Capiz",
  "Iloilo / Guimaras",
  "Negros / Siquijor",
  "Bohol",
  "Cebu",
  "Samar",
  "Leyte / Biliran",
  "Agusan / Surigao / Dinagat Islands",
  "Zamboanga Peninsula / Sulu Archipelago",
  "Zamboanga Sibugay",
  "Mis.Occ/ Lanao del Norte / Lanao del Sur",
  "Davao",
  "Cotabato / Maguindanao",
  "Sultan Kudarat / General Santos / South Cotabato / Sarangani"
]

async function main() {
  console.log(`Start seeding areas...`)
  for (const area of HANDLED_AREAS) {
    const res = await prisma.area.upsert({
      where: { name: area },
      update: {},
      create: { name: area },
    })
    console.log(`Created area: ${res.name}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
