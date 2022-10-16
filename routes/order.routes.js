const express = require('express')
const Route = express.Router()
const { check, param, query } = require('express-validator')

const {
  getAllBookingControllers,
  getBookingByIdControllers,
  getBookingByBookingIdControllers,
  bookingTicketByTicketIdControllers,
  payTicketByBookingIdControllers,
  cancelTicketByBookingIdControllers
} = require('../controllers/order.controllers')
const { verifyToken } = require('../middlewares/verify')
const validate = require('../middlewares/validation')
const { grantedAll } = require('../middlewares/authorization')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getAllBookingControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('ID can\'t be empty').bail().isNumeric().withMessage('ID must be numeric').bail().toInt()
  ]), getBookingByIdControllers)
  .get('/booking/:bookingId', validate([
    param('bookingId').escape().trim().notEmpty().withMessage('Booking ID can\'t be empty')
  ]), verifyToken, grantedAll, getBookingByBookingIdControllers)
  .post('/booking/ticket/:ticketId', validate([
    param('ticketId').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt(),
    check('adult').escape().trim().notEmpty().withMessage('Adult count Can\'t be empty').bail().toInt(),
    check('child').escape().trim().notEmpty().withMessage('Child count Can\'t be empty').bail().toInt(),
    check('description').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Description Can\'t be empty')
  ]), verifyToken, grantedAll, bookingTicketByTicketIdControllers)
  .put('/pay/booking/:bookingId', validate([
    param('bookingId').escape().trim().notEmpty().withMessage('Booking ID can\'t be empty')
  ]), verifyToken, grantedAll, payTicketByBookingIdControllers)
  .put('/cancel/booking/:bookingId', validate([
    param('bookingId').escape().trim().notEmpty().withMessage('Booking ID can\'t be empty')
  ]), verifyToken, grantedAll, cancelTicketByBookingIdControllers)

module.exports = Route
