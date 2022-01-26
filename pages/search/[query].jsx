import React from 'react'

import Layout from '../../components/layout'
import AuctionListItem from '../../components/auctionListItem'
import Sidebar from '../../components/sidebar'

export default function Search({ categories, result, query }) {
  return (
    <Layout title={ 'Searching for "' + query + '"' }>
      <Sidebar categories={ categories } />
      <div className="md:col-span-3">
        <h2 className="font-medium text-4xl mb-8">{result.name}</h2>
        {result.map((auction) => (
          <AuctionListItem {...auction} key={auction.id} />
        ))}
      </div>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
    const { PrismaClient, AuctionStatus } = require('@prisma/client')
    const prisma = new PrismaClient()

    const { query } = context.params

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
							contains: query
						}
					},
					{
						description: {
							contains: query
						}
					},
					{
						requirements: {
							contains: query
						}
					},
				]
			},
		}),
	])

	return {
    	props: {
			categories: categories,
			result: result.map(auction => ({
                ...auction,
                endsAt: auction.endsAt.toISOString(),
                maxPrice: auction.maxPrice.toNumber(),
                bids: [{
                    amount: auction.bids[0].amount.toNumber(),
                }],
            })),
            query: query,
        },
  	}
}
