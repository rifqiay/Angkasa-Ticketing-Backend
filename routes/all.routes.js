const express = require('express')
const Route = express.Router()

const authRoutes = require('./auth.routes')
const profileRoutes = require('./profile.routes')

Route
  .use('/auth', authRoutes)
  .use('/profile', profileRoutes)

module.exports = Route
