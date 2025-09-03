import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | { userId: string } // Or whatever type your user object has
    }
  }
}
