const express = require('express')
const { query, param } = require('express-validator')
const Route = express.Router()

const { getAllTicketControllers, getTicketByIdControllers, getTicketByTicketIdControllers, postTicketControllers, putTicketControllers, deleteTicketControllers } = require('../controllers/ticket.controllers')
const validate = require('../middlewares/validation')
const { grantedAdmin, grantedAll } = require('../middlewares/authorization')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', validate([
    query('search').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().isObject().withMessage('Search query, required object'),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getAllTicketControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('ID can\'t be empty').bail().isNumeric().withMessage('ID must be numeric').bail().toInt()
  ]), getTicketByIdControllers)
  .get('/check/:ticketId', validate([
    param('ticketId').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty')
  ]), verifyToken, grantedAll, getTicketByTicketIdControllers)
  .post('/', verifyToken, grantedAdmin, postTicketControllers)
  .put('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt()
  ]), verifyToken, grantedAdmin, putTicketControllers)
  .delete('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt()
  ]), verifyToken, grantedAdmin, deleteTicketControllers)

module.exports = Route
