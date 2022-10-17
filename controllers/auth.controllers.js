const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const Duration = require('duration-js')
require('dotenv').config()
const {
  JWT_SECRET_KEY,
  JWT_TOKEN_LIFE,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_TOKEN_LIFE,
  JWT_ALGORITHM,
  FRONTEND_URL,
  NODE_ENV
} = process.env
const { encrypt, legacyEncrypt, legacyDecrypt } = require('../helpers/cryptography')
const sendMail = require('../helpers/mailer')
const registrationEmailTemplate = require('../templates/registration.template')
const { random } = require('../helpers/common')
const verificationEmailTemplate = require('../templates/verify.template')
const prisma = require('../config/prisma')
const exclude = require('../helpers/excluder')

module.exports = {
  registerControllers: (req, res) => {
    const main = async () => {
      try {
        const data = req.body
        const bodyLength = Object.keys(data).length
        let result = ''

        if (!bodyLength) throw new createErrors.BadRequest('Request body empty')

        const user = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            profile: {
              select: {
                name: true
              }
            }
          }
        })

        if (user) throw new createErrors.Conflict('Account has been registered')

        const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })
        const randomCode = random(12)
        const encryptRandomCode = legacyEncrypt(randomCode)

        result = await prisma.user.create({
          data: {
            email: data.email,
            password: hashPassword,
            verification_code: randomCode,
            profile: {
              create: {
                name: data.name
              }
            }
          }
        })

        if (!result) throw new createErrors.NotImplemented('Registration failed')

        await sendMail(
          data.email,
          'Verify your account',
          registrationEmailTemplate(req, encryptRandomCode)
        )

        result = {
          message: `Register new account: ${result[0].name}, to continue please verify you're email address first`
        }

        return response(res, 201, result)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authentication Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  verificationControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        const decryptVerificationCode = legacyDecrypt(params.code)
        const user = await prisma.user.findFirst({
          where: {
            verification_code: decryptVerificationCode
          }
        })

        if (!user) throw new createErrors.NotAcceptable('Verification code is not valid')

        const id = user.id
        const result = await prisma.user.update({
          where: {
            id
          },
          data: {
            verification_code: null
          },
          select: {
            profile: {
              select: {
                name: true
              }
            }
          }
        })

        if (!result) throw new createErrors.NotImplemented('Verification failed')

        await sendMail(
          user.email,
          'Account verified',
          verificationEmailTemplate(req)
        )

        res.writeHead(302, { Location: `${FRONTEND_URL}/auth/signin` })
        res.end()
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authentication Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  loginControllers: (req, res) => {
    const main = async () => {
      try {
        const data = req.body
        const bodyLength = Object.keys(data).length
        const sessionToken = req.signedCookies?.token

        if (!bodyLength) throw new createErrors.BadRequest('Request body empty')

        let user = await prisma.user.findFirst({
          where: {
            email: data.email
          }
        })

        if (!user) throw new createErrors.ExpectationFailed('Unregistered account')
        if (sessionToken) throw new createErrors.UnprocessableEntity('Session still active, you need to log out')
        if (user?.verification_code) throw new createErrors.UnprocessableEntity('Account need to verification')

        const verifyPassword = await argon2.verify(user.password, data.password)

        user = exclude(user, ['password'])

        if (!verifyPassword) throw new createErrors.NotAcceptable('Password did not match')

        const dataToSign = { email: user.email }
        const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_TOKEN_LIFE
        })
        const refreshToken = jwt.sign(dataToSign, JWT_REFRESH_SECRET_KEY, {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_REFRESH_TOKEN_LIFE
        })
        const encryptedCookieContent = await encrypt(13, refreshToken)
        const maxAgeCookie = new Duration(JWT_REFRESH_TOKEN_LIFE)

        res.cookie('token', encryptedCookieContent, {
          maxAge: maxAgeCookie,
          expires: maxAgeCookie + Date.now(),
          httpOnly: true,
          sameSite: 'strict',
          secure: NODE_ENV === 'production',
          signed: true
        })

        const addedRefreshToken = await prisma.user.update({
          where: {
            email: data.email
          },
          data: {
            refresh_token: refreshToken
          }
        })

        if (!addedRefreshToken) throw new createErrors.NotAcceptable('Failed to send refresh token')

        user = exclude(user, ['refresh_token', 'verification_code'])

        const users = {
          ...user,
          accessToken
        }

        return response(res, 202, users)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authentication Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  refreshTokenControllers: (req, res) => {
    const main = async () => {
      try {
        const data = req.data

        if (!data) throw new createErrors.NotExtended('Session not found')

        const user = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            email: true
          }
        })

        if (!user) throw new createErrors.ExpectationFailed('Unregistered account')

        const dataToSign = { email: user.email }
        const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_TOKEN_LIFE
        })
        const token = { token: accessToken }

        return response(res, 200, token)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authentication Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  logoutControllers: (req, res) => {
    const main = async () => {
      try {
        const user = req.userData

        if (!user) throw new createErrors.NotExtended('Session not found')

        const removeRefreshToken = await prisma.user.update({
          where: {
            email: user.email
          },
          data: {
            refresh_token: null
          },
          select: {
            profile: {
              select: {
                name: true
              }
            }
          }
        })

        if (!removeRefreshToken) throw new createErrors.NotAcceptable('Failed to remove refresh token')

        res.clearCookie('token')

        const message = { message: 'Successfully log out' }

        return response(res, 200, message)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authentication Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
