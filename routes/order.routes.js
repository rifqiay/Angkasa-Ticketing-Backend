const express = require('express')
const Route = express.Router()
const { check, param } = require('express-validator')

const { bookingTicketByTicketIdControllers, payTicketByBookingIdControllers } = require('../controllers/order.controllers')
const { verifyToken } = require('../middlewares/verify')
const validate = require('../middlewares/validation')
const { grantedAll } = require('../middlewares/authorization')

Route
  .post('/booking/ticket/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt(),
    check('adult').escape().trim().notEmpty().withMessage('Adult count Can\'t be empty').bail().toInt(),
    check('child').escape().trim().notEmpty().withMessage('Child count Can\'t be empty').bail().toInt(),
    check('description').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Description Can\'t be empty')
  ]), verifyToken, grantedAll, bookingTicketByTicketIdControllers)
  .put('/pay/booking/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt()
  ]), verifyToken, grantedAll, payTicketByBookingIdControllers)

module.exports = Route
