import { Router, Request, Response, NextFunction } from 'express'

import Conversation from '../models/conversation'

const router = Router()

router.post(
  '/conversation',
  async (req: Request, res: Response, next: NextFunction) => {
    const name: string = req.body.name

    try {
      const newConversation = new Conversation({ name: name })
      await newConversation.update()

      return res.status(200).json({
        conversation: newConversation,
        daysRemaining: newConversation.getDaysRemaining(),
      })
    } catch (error) {
      return res.status(500).json({
        error: error,
        errorMessage: 'A server error has occured. Please try again later.',
      })
    }
  }
)

router.delete(
  '/conversation/:convoId',
  async (req: Request, res: Response, next: NextFunction) => {
    const convoId: string = req.params.convoId

    try {
      const conversation = await Conversation.findById(convoId)
      await conversation.delete()

      return res.sendStatus(200)
    } catch (error) {
      return res.status(500).json({
        error: error,
        errorMessage: 'A server error has occured. Please try again later.',
      })
    }
  }
)

export default router
