const { PrismaClient, Prisma, AuctionStatus } = require('@prisma/client')
const prisma = new PrismaClient()

import { getCookie } from 'cookies-next';

export default async function handler(req, res) {
	const userCookie = getCookie('user', {req, res})

	// Fail fast but very lazy
	if (!userCookie || userCookie.length === 0) {
        res.status(401).json({
			status: 'error',
            error: {
    			message: 'User is not authorized'
            }
		})
		return
	}

	const { title, description, requirements, maxPrice, instantPrice, categoryId } = req.body
	const username = userCookie

	try {
		const auction = await prisma.$transaction(async prisma => {
			const user = await prisma.user.findUnique({
				select: {
					id: true,
					poster: true
				},
				where: {
					username: username,
				},
			})

			if (!user) {
				throw new Error('Invalid user, please login')
			}

			if (!user.poster) {
				throw new Error('You need to register as poster to start auctions')
			}

			const auction = prisma.auction.create({
				data: {
					title: title,
					description: description,
					requirements: requirements,
					maxPrice: maxPrice,
					instantPrice: instantPrice,
					categoryId: categoryId,
					posterId: user.poster.id,
					status: AuctionStatus.LIVE,
				},
			})

			return auction
		})

		res.status(201).json({
			status: 'success',
			auction: {
				id: auction.id,
				endsAt: auction.endsAt,
			},
		})
	} catch (err) {
		res.status(401).json({
			status: 'error',
			error: {
				messages: err.message
			},
			session: req.session,
		})
	}
}
