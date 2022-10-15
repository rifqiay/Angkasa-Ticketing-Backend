const express = require('express')
const { query, param } = require('express-validator')
const Route = express.Router()

const { getAllTicketControllers, getTicketByIdControllers } = require('../controllers/ticket.controllers')
const validate = require('../middlewares/validation')

Route
  .get('/', validate([
    query('search').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().isObject().withMessage('Search query required object'),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getAllTicketControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Ticket ID can\'t be empty').bail().isNumeric().withMessage('Ticket ID must be numeric').bail().toInt()
  ]), getTicketByIdControllers)

module.exports = Route
