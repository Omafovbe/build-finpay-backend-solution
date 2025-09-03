import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models'
import jwt from 'jsonwebtoken'

const authenticatedToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'secret',
    (err: any, user: any) => {
      if (err) {
        console.error('Token verification error:', err)
        return res.status(403).json({ message: 'Forbidden: Invalid token' })
      }

      req.user = user
      next()
    }
  )
}

export default authenticatedToken
