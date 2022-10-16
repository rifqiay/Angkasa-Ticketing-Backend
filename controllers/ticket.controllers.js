const response = require('../helpers/response')
const createErrors = require('http-errors')
const prisma = require('../config/prisma')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getAllTicketControllers: (req, res) => {
    const main = async () => {
      try {
        const queryParams = req.query
        let result = ''
        let totalRows = 0
        let rowsWithoutLimit = ''

        if (!queryParams) {
          result = await prisma.ticket.findMany({
            include: {
              airline: true
            }
          })

          rowsWithoutLimit = result
        } else {
          const searchOption = Object.keys(queryParams?.search).length

          if (searchOption) {
            result = await prisma.ticket.findMany({
              where: queryParams?.search,
              include: {
                airline: true
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.ticket.findMany({
              where: queryParams?.search,
              include: {
                airline: true
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              }
            })
          } else {
            result = await prisma.ticket.findMany({
              include: {
                airline: true
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.ticket.findMany({
              include: {
                airline: true
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              }
            })
          }
        }

        totalRows = rowsWithoutLimit.length

        const totalActiveRows = result.length
        const sheets = Math.ceil(totalRows / (parseInt(queryParams?.limit) || 0))
        const nextPage = (page, limit, total) => (total / limit) > page ? (limit <= 0 ? false : page + 1) : false
        const previousPage = (page) => page <= 1 ? false : page - 1
        const pagination = {
          total: {
            data: totalRows,
            active: totalActiveRows,
            sheet: sheets === Infinity ? 0 : sheets
          },
          page: {
            limit: parseInt(queryParams?.limit) || 0,
            current: parseInt(queryParams?.page) || 1,
            next: nextPage((parseInt(queryParams?.page) || 1), (parseInt(queryParams?.limit) || 0), totalRows),
            previous: previousPage((parseInt(queryParams?.page) || 1))
          }
        }

        return response(res, 200, result || [], pagination)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Ticket Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  getTicketByIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const id = req.params.id
        const result = await prisma.ticket.findFirst({
          where: { id },
          include: {
            airline: true
          }
        })

        return response(res, 200, result || {})
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Ticket Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  getTicketByTicketIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const ticketId = req.params.ticketId
        const result = await prisma.order.findFirst({
          where: { ticketId },
          include: {
            reservation: true,
            user: true
          }
        })

        if (!result) throw new createErrors.BadRequest('Issued ticket not found')

        if (result.user.id !== userData.id) throw new createErrors.Conflict('You don\'t have access to this issued ticket')

        return response(res, 200, result)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Ticket Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
