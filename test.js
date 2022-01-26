const { PrismaClient, AuctionStatus } = require('@prisma/client')
const prisma = new PrismaClient({
  log: [
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
  ],
})

async function main() {
	// const returnedData = await prisma.user.findUnique({
	// 	where: {
	// 		username: 'kaylie_amets',
	// 	},
	// })
		// const returnedData = await prisma.$transaction(async (prisma) => {
		// 	return prisma.user.findUnique({
		// 		select: {
		// 			id: true,
		// 			poster: true
		// 		},
		// 		where: {
		// 			username: 'kaylie_amet',
		// 		},
		// 	})
		// })

	// const data = {
	// 	email: 'shimon2@yahoo.com',
	// 	name: 'Shimon Schwartz',
	// 	username: 'shimon2',
	// 	poster: {
	// 		create: {

	// 		}
	// 	},
	// }

	// if (false) {
	// 	data.worker = {
	// 		create: {

	// 		}
	// 	}
	// }

	// const returnedData = await prisma.user.create({
	// 	data: data
	// })

    // const returnedData = await prisma.category.findUnique({
    //         select: {
    //             name: true,
    //             slug: true,
    //             auctions: {
    //                 select: {
    //                     id: true,
    //                     endsAt: true,
    //                     title: true,
    //                     maxPrice: true,
    //                     _count: {
    //                         select: { bids: true },
    //                     },
    //                     bids: {
    //                         select: {
    //                             amount: true
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         where: {
    //             slug: 'printing',
    //         },
    //    })
    const returnedData = await prisma.auction.findMany({
            select: {
                id: true,
                endsAt: true,
                title: true,
            //     maxPrice: true,
            //     _count: {
            //         select: { bids: true },
            //     },
			// 	bids: {
			// 		select: {
			// 			amount: true,
			// 		},
			// 		orderBy: {
			// 			amount: 'asc'
			// 		},
			// 		take: 1,
			// 	},
                category: true,
            },
            where: {
                //status: AuctionStatus.LIVE,
				category: {
					slug: 'e-commerce'
				}
            },
            // orderBy: {
            //     bids: {
            //         _count: 'desc',
            //     },
            // },
            // take: 3,
        })
    console.log(returnedData)
}

main()
