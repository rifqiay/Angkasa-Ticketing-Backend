const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const cloudinary = require('cloudinary')
const fs = require('node:fs')
const prisma = require('../config/prisma')
const exclude = require('../helpers/excluder')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getProfileControllers: (req, res) => {
    const main = async () => {
      try {
        const userData = req.userData
        const id = userData?.id
        let user = await prisma.profile.findFirst({
          where: {
            userId: id
          },
          include: {
            user: {
              include: {
                orders: {
                  include: {
                    reservation: {
                      include: {
                        airline: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        user = exclude(user, ['password', 'refresh_token', 'verification_code'])

        if (!user) throw new createErrors.ExpectationFailed('Unregistered account')

        return response(res, 200, user)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Profile Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  },
  editProfileControllers: (req, res) => {
    const main = async () => {
      try {
        const params = req.params
        const paramsLength = Object.keys(params).length
        const data = req.body
        const bodyLength = Object.keys(data).length
        const file = req.files?.picture || {}
        const id = params.id
        const userData = req.userData

        if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty')

        if (!bodyLength) throw new createErrors.BadRequest('Request body empty')

        const user = await prisma.profile.findFirst({
          where: {
            userId: id
          },
          select: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        })

        if (!user) throw new createErrors.ExpectationFailed('Unregistered account')

        if (userData.id !== user.user.id) throw new createErrors.ExpectationFailed('Your profile ID did not match with session')

        if (data?.password) {
          const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })

          data.user.create.password = hashPassword
        }

        if (file.length) {
          cloudinary.v2.config({ secure: true })

          await cloudinary.v2.uploader.upload(file[0].path, {
            use_filename: false,
            unique_filename: true,
            overwrite: true
          }, (pictureError, pictureResponse) => {
            if (pictureError) throw new createErrors.UnsupportedMediaType(`Profile picture: ${pictureError.message}`)

            fs.unlinkSync(file[0].path)

            data.avatar = pictureResponse.secure_url || ''
          })
        }

        const result = await prisma.profile.update({
          where: {
            userId: id
          },
          data,
          select: {
            name: true
          }
        })

        const message = `Profile: ${result.name}, successfully updated`

        return response(res, 200, message)
      } catch (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Profile Controllers: Ends the Query Engine child process and close all connections')

        await prisma.$disconnect()
      })
  }
}
