declare global {
  namespace Express {
    interface Request {
      // This extends the Request interface to include a 'user' property.
      // The user property is optional ('?') because not all requests will be authenticated.
      user?: {
        userId: number | string // Ensure this matches the type of your User ID (number or string)
      }
    }
  }
}
