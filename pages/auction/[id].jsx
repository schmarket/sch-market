import React from 'react'
import Countdown from 'react-countdown';
import Link from 'next/link';
import dayjs from 'dayjs';

const { AuctionStatus } = require('@prisma/client')


import Layout from '../../components/layout'
import Sidebar from '../../components/sidebar'

export default function Search({ categories, auction }) {
    const endsAt = dayjs(auction.endsAt).format('D MMMM YYYY HH:mm')

    return (
        <Layout title={auction.title}>
        <Sidebar categories={ categories } />
        <div className="md:col-span-3">
            <h2 className="font-medium text-4xl mb-8">{auction.title}</h2>
            { auction.status === AuctionStatus.LIVE && (
                <div>
                    <p><b>Time left:</b> <Countdown date={auction.endsAt} /> <b>|</b> { endsAt }</p>
                    <h3 className="font-medium text-3xl mt-8 mb-4">Current Bid:</h3>
                    <p className="text-2xl">
                    {auction.bids.length && (<span>
                        <b className="font-medium">${auction.bids[0].amount}</b> ({auction._count.bids} bids)</span>)}
                        <Link href={"/bid/" + auction.id} key={ "bid_" + auction.id }>
                        <a className="px-3 py-2 rounded bg-green-600 hover:bg-green-800 transition-colors ml-16">Place Your Bid</a>
                        </Link>
                    </p>
                </div>
            )}
            { auction.status === AuctionStatus.ENDED && (
                <div>
                    <p className="font-normal text-2xl mt-8 mb-4">This auction has expired, winning bid is <b className="text-green-600">${auction.bids[0].amount}</b> out of {auction._count.bids} bids</p>
                </div>
            )}

            <h3 className="font-medium text-3xl mt-8 mb-4">Description</h3>
            <p className="prose lg:prose-lg mx-auto max-w-6xl pt-4 pb-8">{auction.description}</p>

            <h3 className="font-medium text-3xl mt-8 mb-4">Requirements</h3>
            <p className="prose lg:prose-lg mx-auto max-w-6xl pt-4 pb-8">{auction.requirements}</p>
        </div>
        </Layout>
  )
}

export const getServerSideProps = async (context) => {
    const { PrismaClient, AuctionStatus } = require('@prisma/client')
    const prisma = new PrismaClient()

    const { id } = context.params

	const [categories, auction] = await prisma.$transaction([
		prisma.category.findMany(),
		prisma.auction.findUnique({
            select: {
                id: true,
                status: true,
                title: true,
                description: true,
                requirements: true,
                createdAt: true,
                endsAt: true,
                maxPrice: true,
                instantPrice: true,
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
                category: true,
                poster: {
					select: {
                        id: true,
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

	return {
    	props: {
			categories: categories,
			auction: {
                ...auction,
                createdAt: auction.createdAt.toISOString(),
                endsAt: auction.endsAt.toISOString(),
                instantPrice: auction.instantPrice ? auction.instantPrice.toNumber() : null,
                maxPrice: auction.maxPrice.toNumber(),
                bids: auction.bids.map(bid => ({
                    ...bid,
                    amount: bid.amount.toNumber(),
                })),
            },
        },
  	}
}
