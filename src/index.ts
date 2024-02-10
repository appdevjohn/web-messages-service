import express, { Request, Response, NextFunction } from 'express'

const app = express()

app.get('/', (_: Request, res: Response, __: NextFunction) => {
  return res.status(200).json({
    message: 'Alive and well!',
  })
})

app.listen(process.env.PORT || 8000, () => {
  console.log(`Now listening on port ${process.env.PORT || 8000}`)
})
