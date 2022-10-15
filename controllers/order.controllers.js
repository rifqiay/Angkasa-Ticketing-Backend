const response = require('../helpers/response')
const createErrors = require('http-errors')
const prisma = require('../config/prisma')
const { randomString } = require('../helpers/common')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  bookingTicketByTicketIdControllers: (req, res) => {
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
            airline: true
          }
        })

        if (!ticket) throw new createErrors.BadRequest('Ticket not found')

        if (ticket.availability === 'UNAVAILABLE') throw new createErrors.BadRequest('Ticket unavailable at time, try next day')

        if (ticket.airline.availability === 'UNAVAILABLE') throw new createErrors.BadRequest('Airport is closed, try next day')

        if (!ticket.stock || ticket.stock <= 1) throw new createErrors.BadRequest('Ticket out of stock')

        const bookingTicket = await prisma.order.create({
          data: {
            ...data,
            bookingId: `BOOKING-${randomString(7)}`,
            userId: userData.id,
            ticketId: ticket.id,
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
        const data = req.body
        const bodyLength = Object.keys(data).length
        const id = params?.id
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        if (!bodyLength) throw new createErrors.BadRequest('Request body empty')

        const booking = await prisma.order.findFirst({
          where: { id },
          include: {
            reservation: true
          }
        })

        if (!booking) throw new createErrors.BadRequest('Booking not found')

        if (booking.status === 'PAID') throw new createErrors.Conflict('Booking already paid')

        if (booking.userId !== userData.id) throw new createErrors.Conflict('You don\'t have access to this ticket')

        const payTicket = await prisma.order.update({
          data: {
            status: 'PAID',
            bookingId: `TICKET-${randomString(10)}`
          },
          where: { id }
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
  }
}
