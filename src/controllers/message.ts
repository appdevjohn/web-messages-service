import { Router, Request, Response, NextFunction } from 'express'

import Message, { ContentType } from '../models/message'

const router = Router()

router.get(
  '/messages',
  async (req: Request, res: Response, next: NextFunction) => {
    const convoId: string = req.query.convoId as string
    const limit: number | undefined = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined
    const skip: number | undefined = req.query.skip
      ? parseInt(req.query.skip as string)
      : undefined

    try {
      const messages = await Message.findByConvoId(convoId, limit, skip)

      return res.status(200).json({
        messages: messages,
      })
    } catch (error) {
      return res.status(500).json({
        error: error,
        errorMessage: 'A server error has occured. Please try again later.',
      })
    }
  }
)

router.post(
  '/message',
  async (req: Request, res: Response, next: NextFunction) => {
    const convoId: string = req.body.convoId
    const content: string = req.body.content

    try {
      const newMessage = new Message({
        convoId: convoId,
        content: content,
        type: ContentType.Text,
      })
      await newMessage.update()

      return res.status(200).json({
        message: newMessage,
      })
    } catch (error) {
      return res.status(500).json({
        error: error,
        errorMessage: 'A server error has occured. Please try again later.',
      })
    }
  }
)

export default router
