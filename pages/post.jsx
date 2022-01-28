import { useEffect, useState } from 'react'

import Layout from '../components/layout'

const { PrismaClient, AuctionStatus } = require('../../marketplace-prisma/backend/node_modules/@prisma/client')
const prisma = new PrismaClient()

export default function Post({ categories }) {
    const [state, setState] = useState({ userMessage: null });

    async function submit(event) {
        event.preventDefault()

        setState({ errorMessage: null });

        const formData = new FormData(event.target)

        const res = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        const json = await res.json()

        if (json.status === 'success') {
            window.location.href = `/auction/${ json.auction.id }`
        } else {
            setState({ errorMessage: json.error.message });
        }

        return false;
    }

    return (
        <Layout title={"Post a new auction"}>
            <div className="w-full md:max-w-full mx-auto md:col-span-8">
                <h2 className="font-medium  text-4xl mb-8">Post a New Auction</h2>
                <div className="p-6 border border-gray-300 sm:rounded-md">
                    {state.errorMessage && <div className="text-white px-6 py-4 border-0 rounded relative mb-4 bg-red-500">
                        <span className="inline-block align-middle mr-8">
                            { state.errorMessage }
                        </span>
                    </div>}
                    <form onSubmit={submit}>
                        <label  className="block mb-6">
                            <span  className="text-gray-700">Title</span>
                            <input type="text" name="title"  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Title" required />
                        </label>

                        <label  className="block mb-6">
                            <span  className="text-gray-700">Description</span>
                            <textarea name="description" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" rows="3" required></textarea>
                        </label>

                        <label  className="block mb-6">
                            <span  className="text-gray-700">Requirements</span>
                            <textarea name="requirements" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" rows="3" required></textarea>
                        </label>

                        <label  className="block mb-6">
                            <span  className="text-gray-700">Category</span>
                            <select name="categoryId" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option>Choose Category</option>
                                {categories.map((category) => (
                                    <option value={ category.id } key={ category.id }>{ category.name }</option>
                                ))}
                            </select>
                        </label>

                        <label  className="block mb-6">
                            <span  className="text-gray-700">Starting Price</span>
                            <input type="text" name="maxPrice" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Max Price" required />
                        </label>

                        <label  className="block mb-6">
                            <span  className="text-gray-700">Instant Price</span>
                            <input type="text" name="instantPrice" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Instant Price" required />
                        </label>


                        <div  className="mb-6">
                            <button type="submit"  className="h-10 px-5 text-indigo-100 bg-indigo-700 rounded-lg transition-colors duration-150 focus:shadow-outline hover:bg-indigo-800">
                            Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )
}

export const getServerSideProps = async () => {
	const [categories] = await prisma.$transaction([
	    prisma.category.findMany(),
	])

	return {
    	props: {
			categories,
		},
  	}
}
