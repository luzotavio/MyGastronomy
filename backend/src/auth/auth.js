import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import { Mongo } from '../database/mongo.js'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { STATUS_CODES } from 'http'

const collectionName = 'users'
const authRouter = express.Router()

passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, callback ) => {
    const user = await Mongo.db
    .collection(collectionName)
    .findOne({email: email})

    if (!user) {
        return callback(null, false)
    }

    const saltBuffer = user.salt.buffer

    crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (err, hashedPassword) => {
        if (err) {
            return callback(null, false)
        }

        const userPasswordBuffer = Buffer.from(user.password.buffer)

        if(!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
            return callback(null, false)
        }

        const {password, salt, ...rest} = user

        return callback(null, rest)
    })
}))


authRouter.post('/signup', async (req,res) => {
    const checkUser = await Mongo.db
    .collection(collectionName)
    .findOne({email: req.body.email})

    if (checkUser) {
        return res.status(500).send({
            success: false,
            statusCode: 500,
            body: {
                text: 'User already exists'
            }
        })
    }
    
    const salt = crypto.randomBytes(16)
    crypto.pbkdf2(req.body.password, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: {
                    text: 'Error on crypto password',
                    err: err
                }
            })
        }

        const result = await Mongo.db
        .collection(collectionName)
        .insertOne({
            email: req.body.email,
            password: hashedPassword,
            salt
        })

        if(result.insertId) {
            const user = await Mongo.db
            .collection(collectionName)
            .findOne({_id: new ObjectId(result.insertId)})

            const token = jwt.sign(user, 'secret')

            return res.send({
                success: true,
                statusCode: 200,
                body: {
                    text: 'User registred correctly',
                    token,
                    user,
                    logged: true
                }
            })
        }
    })
})      

authRouter.post('/login', (req,res) => {
    passport.authenticate('local', (error, user) => {
        if(error) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: {
                    text: 'Error during authentication',
                    error
                }
            })
        }

        if(!user) {
            return res.status(400).send ({
                success: false,
                statusCode: 400,
                body: {
                    text: 'crendentials are not correctly'
                }
            })
        }

        const token = jwt.sign(user, 'secret')
        return res.status(200).send ({
            success: true,
            statusCode: 200,
            body: {
                text: 'User logged in correctly',
                user,
                token
            }
        })
    })(req,res)
})

export default authRouter