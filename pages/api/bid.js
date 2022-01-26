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

	const { auctionId, workerId } = req.body
	const amount = parseInt(req.body.amount)
	const username = userCookie

	try {
		const bid = await prisma.$transaction(async _ => {
			const [lowerBid, auction, user] = await prisma.$transaction([
				prisma.bid.findFirst({
					select: {
						amount: true,
					},
					where: {
						auctionId: auctionId,
						amount: {
							lte: amount
						}
					}
				}),
				prisma.auction.findUnique({
					select: {
						status: true,
						maxPrice: true,
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

			if (auction.maxPrice <= amount) {
				throw new Error(`Bid $${ amount } can't be above max price of $${ auction.maxPrice }`)
			}

			if (lowerBid) {
				throw new Error(`Lower or equal bid of \$${ lowerBid.amount } is found`)
			}

			return prisma.bid.create({
				data: {
					amount: amount,
					auctionId: auctionId,
					workerId: user.worker.id,
				}
			})
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
