import { Router } from 'express'
import {
  getNotificationCount,
  getNotificationById,
  getNotifications,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  clearAllNotifications,
  clearNotificationsByType,
} from '../controllers/notificationCtrl'
import authenticateToken from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

/**
 * @swagger
 * /api/notifications/count:
 *   get:
 *     summary: Get notification count for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status (true for read, false for unread)
 *     responses:
 *       200:
 *         description: Notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Notification count retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *                     isRead:
 *                       type: boolean
 *                       example: null
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/count', getNotificationCount)

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, success, warning, error]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Notifications retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                           isRead:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.get('/', getNotifications)

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Notification retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     type:
 *                       type: string
 *                     isRead:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getNotificationById)

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read/unread for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 default: true
 *                 description: Set to true to mark as read, false to mark as unread
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     isRead:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/read', markNotificationAsRead)

/**
 * @swagger
 * /api/notifications/batch/read:
 *   put:
 *     summary: Mark multiple notifications as read/unread for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of notification IDs to update
 *               isRead:
 *                 type: boolean
 *                 default: true
 *                 description: Set to true to mark as read, false to mark as unread
 *     responses:
 *       200:
 *         description: Notifications updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "5 notifications marked as read successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       example: 5
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       404:
 *         description: No notifications found
 *       500:
 *         description: Internal server error
 */
router.put('/batch/read', markMultipleNotificationsAsRead)

/**
 * @swagger
 * /api/notifications/clear:
 *   delete:
 *     summary: Clear all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "All notifications cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.delete('/clear', clearAllNotifications)

/**
 * @swagger
 * /api/notifications/clear/{type}:
 *   delete:
 *     summary: Clear notifications by type for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [info, success, warning, error]
 *         description: Type of notifications to clear
 *     responses:
 *       200:
 *         description: Notifications cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "info notifications cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *                     type:
 *                       type: string
 *                       example: "info"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
router.delete('/clear/:type', clearNotificationsByType)

export default router
