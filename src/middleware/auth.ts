import { Request as ExpressRequest, Response, NextFunction } from 'express'

import jwt, { JwtPayload } from 'jsonwebtoken'

// declare global {
//   namespace Express {
//     interface Request {
//       user?: CustomJwtPayload
//     }
//   }
// }

interface CustomJwtPayload extends JwtPayload {
  userId: number | string
}

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

const authenticatedToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user) => {
    if (err) {
      console.error('Token verification error:', err)
      return res.status(403).json({ message: 'Forbidden: Invalid token' })
    }

    req.user = user as CustomJwtPayload
    next()
  })
}

export default authenticatedToken
