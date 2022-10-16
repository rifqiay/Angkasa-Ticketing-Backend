const express = require('express')
const Route = express.Router()

const authRoutes = require('./auth.routes')
const profileRoutes = require('./profile.routes')
const airlineRoutes = require('./airline.routes')
const ticketRoutes = require('./ticket.routes')
const orderRoutes = require('./order.routes')

Route
  .use('/auth', authRoutes)
  .use('/profile', profileRoutes)
  .use('/airline', airlineRoutes)
  .use('/ticket', ticketRoutes)
  .use('/order', orderRoutes)

module.exports = Route
