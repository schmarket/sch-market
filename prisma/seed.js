const slugify = require('slugify')
const { PrismaClient } = require('@prisma/client')
const seedData = require('./seed.json')

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  for (const data of seedData.Category) {
    data.slug = slugify(data.name, { lower: true })
    const category = await prisma.category.create({
      data: data,
    })
    console.log(`Created category with id: ${category.name}`)
  }

  for (const data of seedData.User) {
    const date = new Date(data.createdAt)
    data.createdAt = date.toISOString()
    const user = await prisma.user.create({
      data: data
    })
    console.log(`Created user with name: ${user.name}`)
  }

  for (const data of seedData.Poster) {
    const poster = await prisma.poster.create({
      data: data,
    })
    console.log(`Created poster for user id: ${poster.userId}`)
  }

  for (const data of seedData.Worker) {
    const worker = await prisma.worker.create({
      data: data,
    })
    console.log(`Created worker for user id: ${worker.userId}`)
  }

  for (const data of seedData.Auction) {
    const date = new Date(data.createdAt)
    data.createdAt = date.toISOString()
    date.setHours(date.getHours() + data.endsAt)
    data.endsAt = date.toISOString()
    const auction = await prisma.auction.create({
      data: data,
    })
    console.log(`Created auction: ${auction.title}`)
  }

  for (const data of seedData.Bid) {
    const date = new Date(data.createdAt)
    data.createdAt = date.toISOString()
    const bid = await prisma.bid.create({
      data: data,
    })
    console.log(`Created bid for auction id: ${bid.auctionId}`)
  }

  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
