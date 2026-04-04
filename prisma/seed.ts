import { PrismaClient, GameMode, TournamentFormat, TournamentStatus, AdminRole, ParticipationStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // 1. Create Users (Admins and Players)
  const admin = await prisma.user.upsert({
    where: { email: 'jimboy@example.com' },
    update: {},
    create: {
      email: 'jimboy@example.com',
      name: 'Jimboy_Dev',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jimboy',
      mlbbId: '123456789',
      server: '1234',
      rank: 'Mythical Immortal',
    },
  })

  const mod = await prisma.user.upsert({
    where: { email: 'vinz@example.com' },
    update: {},
    create: {
      email: 'vinz@example.com',
      name: 'Vinz_X',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vinz',
      mlbbId: '987654321',
      server: '4321',
      rank: 'Mythic Glory',
    },
  })

  // Create Players
  const playersData = [
    { name: 'Faker_PH', email: 'faker@ph.com' },
    { name: 'yeon_ji', email: 'yeon@ji.com' },
    { name: 'kyle_valdez', email: 'kyle@valdez.com' },
    { name: 'Blacklist_Fan', email: 'blacklist@fan.com' },
    { name: 'danielle_sinocruz', email: 'danielle@sino.com' },
    { name: 'Evang_Dev', email: 'evang@dev.com' },
    { name: 'yara_alishan', email: 'yara@ali.com' },
    { name: 'eb_babes_yosh', email: 'yosh@babes.com' },
    { name: 'wally_bayola', email: 'wally@eat.com' },
  ]

  const players = []
  for (const p of playersData) {
    const player = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`,
        mlbbId: Math.floor(Math.random() * 100000000).toString(),
        server: '1001',
        rank: 'Mythic',
      },
    })
    players.push(player)
  }

  // 2. Create Tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 'tourney-1' }, // Hardcoded ID for easy access
    update: {},
    create: {
      id: 'tourney-1',
      title: 'MLBB 1v1 Classic - 15',
      description: 'SEA Crown Rush - MLBB 1v1 Classic is a daily head-to-head tournament built for players who want pure, individual competition.',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      gameMode: GameMode.SOLO_1V1,
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.REGISTRATION_OPEN,
      startDate: new Date('2026-03-19T20:00:00Z'),
      endDate: new Date('2026-03-20T01:30:00Z'),
      prizePool: '7000 Diamonds',
      entryFee: 'Free for all',
      maxTeams: 64,
      platform: 'Cross Platform',
    },
  })

  // 3. Assign Admins
  await prisma.tournamentAdmin.createMany({
    data: [
      { tournamentId: tournament.id, userId: admin.id, role: AdminRole.ADMIN },
      { tournamentId: tournament.id, userId: mod.id, role: AdminRole.MODERATOR },
    ],
    skipDuplicates: true,
  })

  // 4. Add Participants
  // Add 38 participants to match the UI
  // We'll just reuse the players we created and maybe create more dummy ones if needed
  // For now, let's just add the players we created
  for (const player of players) {
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: tournament.id,
        userId: player.id,
        status: ParticipationStatus.APPROVED,
      },
    }).catch(() => {}) // Ignore duplicates
  }

  // 5. Add Chat Messages
  const messages = [
    { userId: players[0].id, content: "Anyone want to scrim before the tourney starts?" },
    { userId: players[3].id, content: "Looking for a duo partner for the 2v2 event later!" },
    { userId: players[5].id, content: "Good luck everyone! Let's have a clean game." },
  ]

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        tournamentId: tournament.id,
        userId: msg.userId,
        content: msg.content,
      },
    })
  }

  console.log('Seeding finished.')
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
