import React from 'react'

import Layout from '../components/layout'
import AuctionListItem from '../components/auctionListItem'
import Sidebar from '../components/sidebar'

const { PrismaClient, AuctionStatus } = require('../../marketplace-prisma/backend/node_modules/@prisma/client')
const prisma = new PrismaClient()

export default function Home({ categories, mostActiveAuctions, mostRecentAuctions }) {
  return (
    <Layout>
      <Sidebar categories={ categories } />
      <div className="md:col-span-3">
        <h2 className="font-bold text-4xl mb-8">Most Recent Auctions</h2>
        {mostRecentAuctions.map((auction) => (
          <AuctionListItem {...auction} key={auction.id} />
        ))}

        <h2 className="font-bold text-4xl mt-12 mb-4">Most Active Auctions</h2>
        {mostActiveAuctions.map((auction) => (
          <AuctionListItem {...auction} key={auction.id} />
        ))}
      </div>
    </Layout>
  )
}

export const getServerSideProps = async () => {
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

	return {
    	props: {
			categories: categories,
			mostActiveAuctions: mostActiveAuctions.map(auction => ({
				...auction,
				endsAt: auction.endsAt.toISOString(),
				maxPrice: auction.maxPrice.toNumber(),
				bids: [{
					amount: auction.bids[0].amount.toNumber(),
				}]
			})),
			mostRecentAuctions: mostRecentAuctions.map(auction => ({
				...auction,
				endsAt: auction.endsAt.toISOString(),
				maxPrice: auction.maxPrice.toNumber(),
				bids: [{
					amount: auction.bids[0].amount.toNumber(),
				}]
			})),
		},
  	}
}
