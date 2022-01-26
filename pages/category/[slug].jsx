import React from 'react'

const { PrismaClient, AuctionStatus } = require('@prisma/client')

import Layout from '../../components/layout'
import AuctionListItem from '../../components/auctionListItem'
import Sidebar from '../../components/sidebar'

export default function Category({ categories, category }) {
  return (
    <Layout title={'Category ' + category.name}>
      <Sidebar categories={ categories } />
      <div className="md:col-span-3">
        <h2 className="font-medium text-4xl mb-8">{category.name}</h2>
        {category.auctions.map((auction) => (
          <AuctionListItem {...auction} key={auction.id} />
        ))}
      </div>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
    const prisma = new PrismaClient()

    const { slug } = context.params

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
								amount: 'desc'
							},
							take: 1,
						},
					},
				},
			},
			where: {
				slug: slug,
			},
		}),
	])

	return {
    	props: {
			categories: categories,
			category: {
                ...category,
                auctions: category.auctions.map(auction => ({
                    ...auction,
                    endsAt: auction.endsAt.toISOString(),
                    maxPrice: auction.maxPrice.toNumber(),
                    bids: [{
                        amount: auction.bids[0].amount.toNumber(),
                    }]
                })),
            },
        },
  	}
}
