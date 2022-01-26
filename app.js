const cors = require('cors')
const cookieSession = require('cookie-session')
const express = require('express')
const { PrismaClient, AuctionStatus, Prisma } = require('@prisma/client')

const env = process.env.NODE_ENV || 'development';

const prismaClientConfig = {}
if (env !== 'production') {
	prismaClientConfig.log = [
		{
			emit: 'stdout',
			level: 'query',
		},
		{
			emit: 'stdout',
			level: 'error',
		},
		{
			emit: 'stdout',
			level: 'info',
		},
		{
			emit: 'stdout',
			level: 'warn',
		},
	]
}

const prisma = new PrismaClient(prismaClientConfig)

const app = express()
	  app.use(express.json())
	  app.use(cors())
	  app.use(cookieSession({
		// This is obviously not a safe method of storing session data
		// nor is it a proper method for user authentication
		// I am using it here only to mock user login functionality
		name: 'user',
		signed: false,
	  }))

app.get('/', async (req, res) => {
	const [categories, mostActiveAuctions, mostRecentAuctions] = await prisma.$transaction([
	    prisma.category.findMany(),
	    prisma.auction.findMany({
            select: {
                id: true,
                endsAt: true,
                title: true,
                maxPrice: true,
                _count: {
                    select: {
						bids: true
					},
                },
				bids: {
					select: {
						amount: true,
					},
					orderBy: {
						amount: 'asc'
					},
					take: 1,
				},
                category: {
                    select: {
                        name: true,
                        slug: true,
                    }
                },
            },
            where: {
                status: AuctionStatus.LIVE,
            },
            orderBy: {
                bids: {
                    _count: 'desc',
                },
            },
            take: 10,
        }),
	    prisma.auction.findMany({
            select: {
                id: true,
                endsAt: true,
                title: true,
                maxPrice: true,
                _count: {
                    select: {
						bids: true
					},
                },
				bids: {
					select: {
						amount: true,
					},
					orderBy: {
						amount: 'asc'
					},
					take: 1,
				},
                category: {
                    select: {
                        name: true,
                        slug: true,
                    }
                },
            },
            where: {
                status: AuctionStatus.LIVE,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        }),
	])

	res.json({
		categories,
		mostActiveAuctions,
		mostRecentAuctions,
	})
})


app.get('/auction/:id', async (req, res) => {
	const { id } = req.params

	const [categories, auction] = await prisma.$transaction([
		prisma.category.findMany(),
		prisma.auction.findUnique({
			include: {
				// Prisma doesn't yet support complex aggregations
				bids: {
					select: {
						id: true,
						amount: true
					}
				},
				category: true,
				poster: {
					include: {
						user: {
							select: {
								username: true,
								reviews: {
									select: {
										rating: true
									}
								}
							}
						}
					}
				}
			},
			where: {
				id: id
			},
		}),
	])

	res.json([categories, auction])
})

app.post('/bid', async (req, res) => {
	// Fail fast
	if (!req.session || !req.session.isLoggedIn) {
		res.status(401).json({
			status: 'error',
			message: 'User is not authorized'
		})
		return
	}

	const { amount, auctionId, workerId } = req.body

	try {
		const bid = await prisma.$transaction(async _ => {
			const [lowerBid, auction] = await prisma.$transaction([
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
				})
			])

			if (auction.status !== AuctionStatus.LIVE) {
				throw new Error(`Can't bid on auction with status ${ auction.status }`)
			}

			if (auction.maxPrice <= amount) {
				throw new Error(`Bid can't be above max price`)
			}

			if (lowerBid) {
				throw new Error(`Lower or equal bid of \$${ lowerBid.amount } is found`)
			}

			return prisma.bid.create({
				data: {
					amount: amount,
					auctionId: auctionId,
					workerId: workerId,
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
})

app.get('/category/:slug', async (req, res) => {
	const { slug } = req.params

	const [categories, category] = await prisma.$transaction([
		prisma.category.findMany(),
		prisma.category.findUnique({
			select: {
				name: true,
				slug: true,
				auctions: {
					select: {
						id: true,
						endsAt: true,
						title: true,
						maxPrice: true,
						_count: {
							select: {
								bids: true
							},
						},
						bids: {
							select: {
								amount: true,
							},
							orderBy: {
								amount: 'asc'
							},
							take: 1,
						},
					}
				}
			},
			where: {
				slug: slug,
			},
		}),
	])

	res.json([categories, category])
})

app.get('/user/:username', async (req, res) => {
	res.json('Not implemented yet')
})

app.get('/user/:username/reviews', async (req, res) => {
	res.json('Not implemented yet')
})

app.get('/login', async (req, res) => {})
app.post('/login', async (req, res) => {
	const { username } = req.body

	const user = await prisma.user.findUnique({
		where: {
			username: username,
		},
	})

	if (!user) {
		res.status(404).json({
			status: 'error',
			error: {
				message: `Username ${username} not found`,
			},
		})
	} else {
		req.session.username = username
		req.session.isLoggedIn = true

		res.status(200).json({
			status: 'success',
			user: {
				username: username,
				isLoggedIn: true,
			},
		})
	}
})

app.get('/logout', async (req, res) => {
	req.session = null

	res.redirect('/marketplace?logged_out')
})

app.get('/post', async (req, res) => {
	const [categories] = await prisma.$transaction([
		prisma.category.findMany(),
	])

})
app.post('/post', async (req, res) => {
	// Fail fast
	if (!req.session || !req.session.isLoggedIn) {
		res.status(401).json({
			status: 'error',
			message: 'User is not authorized'
		})
		return
	}

	const { title, description, requirements, maxPrice, instantPrice, categoryId } = req.body
	const { username } = req.session

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
})

app.post('/review', async (req, res) => {
	res.json('Not implemented yet')
})

app.get('/search/:searchTerm', async (req, res) => {
	const { searchTerm } = req.params

	const [categories, result] = await prisma.$transaction([
		prisma.category.findMany(),
		prisma.auction.findMany({
			select: {
				id: true,
				endsAt: true,
				title: true,
				maxPrice: true,
				_count: {
					select: { bids: true },
				},
				category: true,
				bids: {
					select: {
						amount: true,
					},
					orderBy: {
						amount: 'asc'
					},
					take: 1,
				},
			},
			where: {
				status: AuctionStatus.LIVE,
				OR: [
					{
						title: {
							contains: searchTerm
						}
					},
					{
						description: {
							contains: searchTerm
						}
					},
					{
						requirements: {
							contains: searchTerm
						}
					},
				]
			},
		}),
	])

	res.json([categories, result])
})

app.get('/signup', async (req, res) => {})
app.post('/signup', async (req, res) => {
	// Fail fast
	if (!req.session || !req.session.isLoggedIn) {
		res.status(403).json({
			status: 'error',
			message: 'User is already registered'
		})
		return
	}

	const { email, name, username, isWorker } = req.body

	const data = {
		email: email,
		name: name,
		username: username,
		poster: {
			create: {}
		},
	}

	if (isWorker) {
		data.worker = {
			create: {}
		}
	}

	try {
		const user = await prisma.user.create({
			data: data
		})

		req.session.username = user.username
		req.session.isLoggedIn = true

		res.status(201).json({
			status: 'success',
			user: {
				id: user.id,
				username: user.username
			}
		})
	} catch (err) {
		let message = 'Something went wrong, try again'
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			message = `This ${ err.meta.target[0] } is already in use`
		}

		res.status(400).json({
			status: 'error',
			error: {
				message: message
			}
		})
	}
})

const server = app.listen(3000, () =>
  console.log(`🚀 Server in ${env} mode is ready at: http://localhost:3000`),
)

// function findLowestBid(bids) {
// 	return bids.reduce((a, b))
// 	return Math.min(...bids.map(bid => bid.amount))
// }
