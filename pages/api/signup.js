const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

import { getCookie, setCookies } from 'cookies-next';

export default async function handler(req, res) {
	const userCookie = getCookie('user', {req, res})

	// Fail fast but very lazy
	if (userCookie && userCookie.length > 0) {
		res.status(403).json({
			status: 'error',
			error: {
				message: 'You are already logged in',
			},
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

		setCookies('user', user.username, { req, res });

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
			message = `The username "${ username }" is already in use`
		}

		res.status(400).json({
			status: 'error',
			error: {
				message: message
			}
		})
	}
}
