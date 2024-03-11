import http from 'http'
import { Server } from 'socket.io'

import Message, { ContentType } from '../models/message'

/**
 * The object used to emit information to sockets.
 */
let io: Server

/**
 * This function must be run as early as possible, or socket-based updates will not work.
 * @param server The Node http server which this socket.io Server instance will be attached.
 */
export const setupSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: 'GET',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  })

  io.on('connection', (socket) => {
    // Send a message.
    socket.on('send-message', ({ convoId, content }) => {
      const message = new Message({
        convoId: convoId,
        type: ContentType.Text,
        content: content,
      })
      message.update()
    })
  })
}

/**
 * Sends an update to each participant in a conversation where a message was just sent.
 * @param convoId Participants of this conversation will be sent an update.
 * @param message The message content of the update.
 */
export const updateConversation = (convoId: string, message: Message) => {
  io?.emit(convoId, message)
}
