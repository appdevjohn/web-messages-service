import http from 'http'
import { Server } from 'socket.io'

import Message, { ContentType } from '../models/message'
import Conversation from '../models/conversation'

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
    // Get messages
    socket.on('get-messages', async ({ convoId }) => {
      if (!convoId) {
        socket.emit('error', 'Sending a message requires a convoId.')
        return
      }

      try {
        const conversation = await Conversation.findById(convoId)
        const messages = await Message.findByConvoId(convoId, 50, 0)
        socket.emit('messages', {
          messages,
          conversation,
          daysRemaining: conversation.getDaysRemaining(),
        })
      } catch (error) {
        socket.emit(
          'error',
          error ? error.toString() : 'There was an error getting the messages.'
        )
      }
    })

    // Send a message.
    socket.on(
      'send-message',
      async ({ convoId, content, userName, userAvatar }) => {
        if (!convoId || !content || !userName || !userAvatar) {
          socket.emit(
            'error',
            'Sending a message requires both convoId and content values.'
          )
          return
        }

        try {
          const newMessage = new Message({
            convoId: convoId,
            content: content,
            type: ContentType.Text,
            senderName: userName,
            senderAvatar: userAvatar,
          })
          await newMessage.update()
          socket.emit('response', {
            event: 'send-message',
            message: newMessage,
          })
          updateConversation(convoId, newMessage)
        } catch (_) {
          socket.emit('error', 'There was an error sending the message.')
        }
      }
    )

    // Create a conversation.
    socket.on('create-conversation', async ({ name }) => {
      if (!name) {
        socket.emit('error', 'Creating a conversation requires a name.')
        return
      }

      try {
        const newConversation = new Conversation({ name: name })
        await newConversation.update()
        socket.emit('response', {
          event: 'create-conversation',
          conversation: newConversation,
          daysRemaining: newConversation.getDaysRemaining(),
        })
      } catch (_) {
        socket.emit('error', 'There was an error creating the conversation.')
      }
    })

    // Delete a conversation.
    socket.on('delete-conversation', async ({ convoId }) => {
      if (!convoId) {
        socket.emit('error', 'Deleting a conversation requires a convoId.')
        return
      }

      try {
        const conversation = await Conversation.findById(convoId)
        await conversation.delete()
        socket.emit('response', {
          event: 'delete-conversation',
          conversation: conversation,
        })
      } catch (_) {
        socket.emit('error', 'There was an error deleting the conversation.')
      }
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
