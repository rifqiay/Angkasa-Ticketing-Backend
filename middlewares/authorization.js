const response = require('../helpers/response')
const createErrors = require('http-errors')
const prisma = require('../config/prisma')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  grantedAll: (req, res, next) => {
    const main = async () => {
      try {
        const email = req.userData.email
        const user = await prisma.user.findFirst({
          where: {
            email
          },
          select: {
            role: true
          }
        })

        if (!user) throw new createErrors.Unauthorized('Access denied, account unregistered')

        const { role } = user

        switch (role) {
          case 'USER':
            return next()
          case 'ADMIN':
            return next()

          default:
            throw new createErrors.Unauthorized('Access denied, Role is not defined')
        }
      } catch (error) {
        return response(res, error.status, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authorization Middlewares: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  grantedAdmin: (req, res, next) => {
    const main = async () => {
      try {
        const email = req.userData.email
        const checkUser = await prisma.user.findFirst({
          where: {
            email
          },
          select: {
            role: true
          }
        })

        if (!checkUser) throw new createErrors.Unauthorized('Access denied, account unregistered')

        const { role } = checkUser

        switch (role) {
          case 'ADMIN':
            return next()

          default:
            throw new createErrors.Unauthorized('Access denied, only admin can enter')
        }
      } catch (error) {
        return response(res, error.status, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authorization Middlewares: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
