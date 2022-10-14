const express = require('express')
const Route = express.Router()

const authRoutes = require('./auth.routes')
const profileRoutes = require('./profile.routes')
const airlineRoutes = require('./airline.routes')

Route
  .use('/auth', authRoutes)
  .use('/profile', profileRoutes)
  .use('/airline', airlineRoutes)

module.exports = Route
