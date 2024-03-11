import path from 'path'
import { createServer } from 'http'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import messageController from './controllers/message'
import conversationController from './controllers/conversation'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: 'GET',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
})

app.use(cors())
app.use(express.json())

io.on('connection', (socket) => {
  console.log('a user connected!')

  socket.on('disconnect', () => {
    console.log('a user disconnected!')
  })
})

app.get('/', (_: Request, res: Response, __: NextFunction) => {
  return res.status(200).json({
    message: 'Alive and well!',
  })
})

app.use(messageController)
app.use(conversationController)

server.listen(process.env.PORT || 8000, () => {
  console.log(`Now listening on port ${process.env.PORT || 8000}`)
})
