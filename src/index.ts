import path from 'path'
import { createServer } from 'http'
import express, { Request, Response, NextFunction } from 'express'
import { CronJob } from 'cron'
import cors from 'cors'
import dotenv from 'dotenv'
import { deleteConversations } from './util/cron'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { setupSocketIO } from './util/io'
import messageController from './controllers/message'
import conversationController from './controllers/conversation'

const app = express()
const server = createServer(app)
app.use(cors())
app.use(express.json())

setupSocketIO(server)

app.get('/', (_: Request, res: Response, __: NextFunction) => {
  return res.status(200).json({
    message: 'Alive and well!',
  })
})

app.use(messageController)
app.use(conversationController)

const job = CronJob.from({
  cronTime: '0 0 * * * *',
  onTick: deleteConversations,
  timeZone: 'America/New_York',
})

server.listen(process.env.PORT || 8000, () => {
  console.log(`Now listening on port ${process.env.PORT || 8000}`)
  job.start()
})
