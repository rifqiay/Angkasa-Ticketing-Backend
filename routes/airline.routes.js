const express = require('express')
const { query, param } = require('express-validator')
const Route = express.Router()

const { getAllAirlineControllers, getAirlineByIdControllers } = require('../controllers/airline.controllers')
const { grantedAdmin } = require('../middlewares/authorization')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), verifyToken, grantedAdmin, getAllAirlineControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Airline ID can\'t be empty').bail().isNumeric().withMessage('Airline ID must be numeric').bail().toInt()
  ]), getAirlineByIdControllers)

module.exports = Route
