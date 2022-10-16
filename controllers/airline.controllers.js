const response = require('../helpers/response')
const createErrors = require('http-errors')
const prisma = require('../config/prisma')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getAllAirlineControllers: (req, res) => {
    const main = async () => {
      try {
        const queryParams = req.query
        let result = ''
        let totalRows = 0
        let rowsWithoutLimit = ''

        if (!queryParams) {
          result = await prisma.airline.findMany()

          rowsWithoutLimit = result
        } else {
          if (queryParams?.search) {
            result = await prisma.airline.findMany({
              where: {
                title: {
                  search: queryParams?.search
                }
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.airline.findMany({
              where: {
                title: {
                  search: queryParams?.search
                }
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              }
            })
          } else {
            result = await prisma.airline.findMany({
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.airline.findMany({
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
        if (NODE_ENV === 'development') console.log('Airline Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  getAirlineByIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const id = req.params.id
        const result = await prisma.airline.findFirst({
          where: { id }
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
        if (NODE_ENV === 'development') console.log('Airline Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
