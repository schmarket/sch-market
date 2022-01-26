import { useEffect, useState } from 'react'

import Layout from '../../components/layout'

export default function Bid({ auction }) {
    const [state, setState] = useState({ userMessage: null });

    async function submit(event) {
        event.preventDefault()

        setState({ errorMessage: null });

        const formData = new FormData(event.target)

        const res = await fetch('/api/bid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        const json = await res.json()

        if (json.status === 'success') {
            window.location.href = `/auction/${ json.bid.auctionId }`
        } else {
            setState({ errorMessage: json.error.message });
        }

        return false;
    }


    return (
    <Layout title={"Bidding on " + auction.title}>
        <div className="w-full md:w-96 md:max-w-full mx-auto md:col-span-4">

            <h2 className="font-medium  text-4xl mb-8">Bidding on {auction.title}</h2>
            <div className="p-6 border border-gray-300 sm:rounded-md">
                {state.errorMessage && <div className="text-white px-6 py-4 border-0 rounded relative mb-4 bg-red-500">
                    <span className="inline-block align-middle mr-8">
                        { state.errorMessage }
                    </span>
                </div>}
                <form onSubmit={submit}>
                    <label  className="block mb-6">
                        <span  className="text-gray-700">New Bid Amount (more than ${ auction.bids.length ? auction.bids[0].amount : auction.maxPrice })</span>
                        <input type="text" name="amount"  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Bid Amount" required />
                    </label>

                    <input type="hidden" name="auctionId" value={ auction.id } />

                    <div  className="mb-6">
                        <button type="submit"  className="h-10 px-5 text-indigo-100 bg-indigo-700 rounded-lg transition-colors duration-150 focus:shadow-outline hover:bg-indigo-800">
                        Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
    const { PrismaClient, AuctionStatus } = require('@prisma/client')
    const prisma = new PrismaClient()

    const { id } = context.params

	const auction = await prisma.auction.findUnique({
        select: {
            id: true,
            title: true,
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
                    amount: 'desc'
                },
                take: 1,
            },
        },
        where: {
            id: id
        },
    })


	return {
    	props: {
			auction: {
                ...auction,
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
