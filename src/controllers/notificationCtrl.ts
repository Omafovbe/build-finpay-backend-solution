import { Request as ExpressRequest, Response } from 'express'
import { Notification } from '../models'
import { Op } from 'sequelize'

type AuthRequest = ExpressRequest & {
  user?: {
    userId: number | string
    iat?: number
    exp?: number
    [key: string]: any
  }
}

/**
 * Get notification count for the authenticated user
 */
export const getNotificationCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const { isRead } = req.query

    // Build where condition
    const whereCondition: any = { userId }

    if (isRead !== undefined) {
      whereCondition.isRead = isRead === 'true'
    }

    const count = await Notification.count({
      where: whereCondition,
    })

    res.status(200).json({
      status: 200,
      message: 'Notification count retrieved successfully',
      data: {
        count,
        isRead: isRead !== undefined ? isRead === 'true' : null,
      },
    })
  } catch (error: any) {
    console.error('Error retrieving notification count:', error)
    res.status(500).json({
      message: 'Failed to retrieve notification count',
      error: error.message,
    })
  }
}

/**
 * Get notification by ID for the authenticated user
 */
export const getNotificationById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    const notification = await Notification.findOne({
      where: {
        id,
        userId,
      },
    })

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found or access denied',
      })
    }

    res.status(200).json({
      status: 200,
      message: 'Notification retrieved successfully',
      data: notification,
    })
  } catch (error: any) {
    console.error('Error retrieving notification:', error)
    res.status(500).json({
      message: 'Failed to retrieve notification',
      error: error.message,
    })
  }
}

/**
 * Get all notifications for the authenticated user with pagination
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    const { limit = 10, offset = 0, isRead, type } = req.query

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    // Build where condition
    const whereCondition: any = { userId }

    if (isRead !== undefined) {
      whereCondition.isRead = isRead === 'true'
    }

    if (type) {
      whereCondition.type = type
    }

    const notifications = await Notification.findAll({
      where: whereCondition,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    })

    const totalCount = await Notification.count({
      where: whereCondition,
    })

    res.status(200).json({
      status: 200,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore:
            parseInt(offset as string) + parseInt(limit as string) < totalCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Error retrieving notifications:', error)
    res.status(500).json({
      message: 'Failed to retrieve notifications',
      error: error.message,
    })
  }
}

/**
 * Mark notification as read/unread for the authenticated user
 */
export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params
    const { isRead = true } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    const notification = await Notification.findOne({
      where: {
        id,
        userId,
      },
    })

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found or access denied',
      })
    }

    await notification.update({ isRead })

    res.status(200).json({
      status: 200,
      message: `Notification marked as ${
        isRead ? 'read' : 'unread'
      } successfully`,
      data: notification,
    })
  } catch (error: any) {
    console.error('Error updating notification:', error)
    res.status(500).json({
      message: 'Failed to update notification',
      error: error.message,
    })
  }
}

/**
 * Mark multiple notifications as read for the authenticated user
 */
export const markMultipleNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId
    const { notificationIds, isRead = true } = req.body

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: 'Notification IDs array is required' })
    }

    // Update all notifications for the user with the given IDs
    const [updatedRowsCount] = await Notification.update(
      { isRead },
      {
        where: {
          id: { [Op.in]: notificationIds },
          userId,
        },
      }
    )

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        message: 'No notifications found or access denied',
      })
    }

    res.status(200).json({
      status: 200,
      message: `${updatedRowsCount} notifications marked as ${
        isRead ? 'read' : 'unread'
      } successfully`,
      data: {
        updatedCount: updatedRowsCount,
        isRead,
      },
    })
  } catch (error: any) {
    console.error('Error updating notifications:', error)
    res.status(500).json({
      message: 'Failed to update notifications',
      error: error.message,
    })
  }
}

/**
 * Clear all notifications for the authenticated user
 */
export const clearAllNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    const deletedCount = await Notification.destroy({
      where: { userId },
    })

    res.status(200).json({
      status: 200,
      message: 'All notifications cleared successfully',
      data: {
        deletedCount,
      },
    })
  } catch (error: any) {
    console.error('Error clearing notifications:', error)
    res.status(500).json({
      message: 'Failed to clear notifications',
      error: error.message,
    })
  }
}

/**
 * Clear notifications by type for the authenticated user
 */
export const clearNotificationsByType = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId
    const { type } = req.params

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Authentication error: User not found' })
    }

    if (!type) {
      return res.status(400).json({ message: 'Notification type is required' })
    }

    // Validate notification type
    const validTypes = ['info', 'success', 'warning', 'error']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid notification type. Must be one of: ${validTypes.join(
          ', '
        )}`,
      })
    }

    const deletedCount = await Notification.destroy({
      where: {
        userId,
        type,
      },
    })

    res.status(200).json({
      status: 200,
      message: `${type} notifications cleared successfully`,
      data: {
        deletedCount,
        type,
      },
    })
  } catch (error: any) {
    console.error('Error clearing notifications by type:', error)
    res.status(500).json({
      message: 'Failed to clear notifications by type',
      error: error.message,
    })
  }
}

/**
 * Create a new notification (for internal use by the system)
 */
export const createNotification = async (
  userId: number,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  data?: any
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      data: data ? JSON.stringify(data) : null,
    })

    return notification
  } catch (error: any) {
    console.error('Error creating notification:', error)
    throw error
  }
}
