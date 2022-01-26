const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

import { getCookie, setCookies } from 'cookies-next';

export default async function handler(req, res) {
	const { username } = req.body
	try {
		const user = await prisma.user.findUnique({
            select: {
                id: true,
                username: true,
            },
            where: {
                username: username,
            },
        })

        if (!user) {
            throw new Error('User not found')
        }

		setCookies('user', user.username, { req, res });

		res.status(201).json({
			status: 'success',
			user: {
				id: user.id,
				username: user.username
			}
		})
	} catch (err) {
		let message = err.message
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
