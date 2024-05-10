import Conversation from '../models/conversation'

/**
 * Deletes conversations that are older than 30 days.
 */
export const deleteConversations = async () => {
  await Conversation.findByAge(30, true)
}
