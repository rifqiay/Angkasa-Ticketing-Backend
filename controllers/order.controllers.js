const response = require('../helpers/response')
const createErrors = require('http-errors')
const prisma = require('../config/prisma')
const { randomString } = require('../helpers/common')
const exclude = require('../helpers/excluder')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getAllBookingControllers: (req, res) => {
    const main = async () => {
      try {
        const queryParams = req.query
        let result = ''
        let totalRows = 0
        let rowsWithoutLimit = ''

        if (!queryParams) {
          result = await prisma.order.findMany({
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              reservation: {
                include: {
                  airline: true
                }
              }
            }
          })

          rowsWithoutLimit = result
        } else {
          const searchOption = Object.keys(queryParams?.search).length

          if (searchOption) {
            result = await prisma.order.findMany({
              where: {
                OR: [
                  {
                    bookingId: {
                      contains: queryParams?.search
                    }
                  },
                  {
                    description: {
                      contains: queryParams?.search
                    }
                  },
                  {
                    status: {
                      equals: queryParams?.search
                    }
                  },
                  {
                    passenger: {
                      in: [queryParams?.search]
                    }
                  },
                  {
                    adult: {
                      in: [queryParams?.search]
                    }
                  },
                  {
                    child: {
                      in: [queryParams?.search]
                    }
                  },
                  {
                    price: {
                      in: [queryParams?.search]
                    }
                  }
                ]
              },
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                reservation: {
                  include: {
                    airline: true
                  }
                }
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.order.findMany({
              where: {
                OR: [
                  {
                    bookingId: {
                      contains: queryParams?.search
                    }
                  },
                  {
                    description: {
                      contains: queryParams?.search
                    }
                  },
                  {
                    status: {
                      equals: queryParams?.search
                    }
                  },
                  {
                    passenger: {
                      gte: parseInt(queryParams?.search)
                    }
                  },
                  {
                    adult: {
                      gte: parseInt(queryParams?.search)
                    }
                  },
                  {
                    child: {
                      gte: parseInt(queryParams?.search)
                    }
                  },
                  {
                    price: {
                      gte: parseInt(queryParams?.search)
                    }
                  }
                ]
              },
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                reservation: {
                  include: {
                    airline: true
                  }
                }
              },
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              }
            })
          } else {
            result = await prisma.order.findMany({
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                reservation: {
                  include: {
                    airline: true
                  }
                }
              },
              skip: Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0),
              take: parseInt(queryParams?.limit) || 10
            })

            rowsWithoutLimit = await prisma.order.findMany({
              orderBy: queryParams?.orderBy || {
                id: 'desc'
              },
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                reservation: {
                  include: {
                    airline: true
                  }
                }
              }
            })
          }
        }

        result = exclude(result, [
          'password',
          'refresh_token',
          'verification_code'
        ]
        )
        rowsWithoutLimit = exclude(rowsWithoutLimit, [
          'password',
          'refresh_token',
          'verification_code'
        ]
        )
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
        if (NODE_ENV === 'development') console.log('Booking Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  getBookingByIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const id = req.params.id
        let result = await prisma.order.findFirst({
          where: { id },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            reservation: {
              include: {
                airline: true
              }
            }
          }
        })

        result = exclude(result, [
          'password',
          'refresh_token',
          'verification_code'
        ]
        )

        return response(res, 200, result || {})
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Booking Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  getBookingByBookingIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const bookingId = req.params.bookingId
        let result = await prisma.order.findFirst({
          where: { bookingId },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            reservation: {
              include: {
                airline: true
              }
            }
          }
        })

        if (!result) throw new createErrors.BadRequest('Booking not found')

        if (result.user.id !== userData.id) throw new createErrors.Conflict('You don\'t have access to this booking')

        result = exclude(result, [
          'password',
          'refresh_token',
          'verification_code'
        ]
        )

        return response(res, 200, result)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Booking Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  bookingTicketByIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const data = req.body
        const bodyLength = Object.keys(data).length
        const id = params?.id
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        if (!bodyLength) throw new createErrors.BadRequest('Request body empty')

        const ticket = await prisma.ticket.findFirst({
          where: { id },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            reservation: {
              include: {
                airline: true
              }
            }
          }
        })
        const booking = await prisma.order.findFirst({
          where: {
            status: 'UNPAID',
            reservation: {
              id
            }
          }
        })

        if (!ticket) throw new createErrors.BadRequest('Ticket not found')

        if (booking) throw new createErrors.Conflict('You already have booking ticket that have no unpaid, please pay your order first or you need to cancel booking later')

        if (ticket.availability === 'UNAVAILABLE') throw new createErrors.BadRequest('Ticket unavailable at time, try next day')

        if (ticket.airline.availability === 'UNAVAILABLE') throw new createErrors.BadRequest('Airport is closed, try next day')

        if (!ticket.stock || ticket.stock <= 1) throw new createErrors.BadRequest('Ticket out of stock')

        const bookingTicket = await prisma.order.create({
          data: {
            ...data,
            bookingId: `BOOKING-${randomString(7)}`,
            userId: userData.id,
            reservationId: ticket.id,
            passenger: data.adult + data.child,
            price: (data.adult + data.child) * ticket.price
          }
        })

        if (!bookingTicket) throw new createErrors.Conflict('Booking ticket failed')

        const message = {
          message: 'Success to order ticket'
        }

        return response(res, 201, message)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Order Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  payTicketByBookingIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const bookingId = params?.bookingId
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const booking = await prisma.order.findFirst({
          where: {
            bookingId
          },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            reservation: {
              include: {
                airline: true
              }
            }
          }
        })

        if (!booking) throw new createErrors.BadRequest('Booking not found')

        if (booking.status === 'PAID') throw new createErrors.Conflict('Booking already paid')

        if (booking.user.id !== userData.id) throw new createErrors.Conflict('You don\'t have access to this booking')

        const payTicket = await prisma.order.update({
          data: {
            status: 'PAID',
            ticketId: `TICKET-${randomString(10)}`
          },
          where: {
            bookingId: booking.bookingId
          }
        })

        if (!payTicket) throw new createErrors.Conflict('Failed to pay ticket')

        const message = {
          message: 'Success to pay ticket'
        }

        return response(res, 201, message)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Order Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  cancelTicketByBookingIdControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const bookingId = params?.bookingId
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const booking = await prisma.order.findFirst({
          where: {
            bookingId
          },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            reservation: {
              include: {
                airline: true
              }
            }
          }
        })

        if (!booking) throw new createErrors.BadRequest('Booking not found')

        if (booking.status === 'PAID') throw new createErrors.Conflict('Booking already paid')

        if (booking.status === 'CANCEL') throw new createErrors.Conflict('Booking already canceled')

        if (booking.user.id !== userData.id) throw new createErrors.Conflict('You don\'t have access to this booking')

        const cancelTicket = await prisma.order.update({
          data: {
            status: 'CANCEL'
          },
          where: {
            bookingId: booking.bookingId
          }
        })

        if (!cancelTicket) throw new createErrors.Conflict('Failed to cancel ticket')

        const message = {
          message: 'Success to cancel ticket'
        }

        return response(res, 201, message)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Order Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
