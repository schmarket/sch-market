const { PrismaClient, Prisma, AuctionStatus } = require('@prisma/client')
const prisma = new PrismaClient()

import { getCookie, setCookies } from 'cookies-next';

export default async function handler(req, res) {
	const userCookie = getCookie('user', {req, res})

	// Fail fast
	if (!userCookie || userCookie.length === 0) {
		res.status(401).json({
			status: 'error',
			error: {
				message: 'User is not authorized',
			},
		})
		return
	}

	const { auctionId } = req.body
	const username = userCookie

	try {
		const [bid, auction] = await prisma.$transaction(async _ => {
			const [currentWinningBid, auction, user] = await prisma.$transaction([
				prisma.bid.findFirst({
					select: {
						amount: true,
					},
					where: {
						auctionId: auctionId,
					},
					orderBy: {
						amount: 'desc',
					}
				}),
				prisma.auction.findUnique({
					select: {
						status: true,
						maxPrice: true,
						instantPrice: true,
					},
					where: {
						id: auctionId
					},
				}),
				prisma.user.findUnique({
					select: {
						id: true,
						worker: true,
					},
					where: {
						username: username,
					},
				}),
			])

			if (!user) {
				throw new Error('Invalid user, please login')
			}

			if (!auction) {
				throw new Error('Invalid auction')
			}

			if (auction.status !== AuctionStatus.LIVE) {
				throw new Error(`Can't bid on auction with status ${ auction.status }`)
			}

			if (auction.instantPrice === null) {
				throw new Error(`This auction does not have an Instant Price set`)
			}

			// if (auction.maxPrice > amount) {
			// 	throw new Error(`Bid $${ amount } can't be below max price of $${ auction.maxPrice }`)
			// }

			// throw new Error(` ${ JSON.stringify(currentWinningBid) } ${ JSON.stringify(auction.instantPrice) } `)

			if (currentWinningBid && currentWinningBid.amount > auction.instantPrice) {
				throw new Error(`There is a higher bid than Instant Price available`)
			}

			return prisma.$transaction([
				prisma.bid.create({
					data: {
						amount: auction.instantPrice,
						auctionId: auctionId,
						workerId: user.worker.id,
					},
				}),
				prisma.auction.update({
					data: {
						status: AuctionStatus.ENDED
					},
					where: {
						id: auctionId
					}
				})
			])
		})

		res.status(201).json({
			status: 'success',
			bid: {
				amount: bid.amount,
				auctionId: bid.auctionId,
				workerId: bid.workerId,
			},
		})
	} catch (err) {
		res.status(400).json({
			status: 'error',
			error: {
				err: err.lineNumber,
				message: err.message
			}
		})
	}
}
