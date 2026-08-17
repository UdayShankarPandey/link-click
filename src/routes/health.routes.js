import { Router } from 'express';
import { getHealth, getReadiness } from '../controllers/health.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health and readiness checks
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check system health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is healthy."
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "UP"
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: string
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     environment:
 *                       type: string
 *                       example: "development"
 */
router.get('/', getHealth);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Check system readiness (e.g. database connectivity)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Readiness status retrieved."
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "READY"
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: string
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *       503:
 *         description: System is not ready
 */
router.get('/ready', getReadiness);

export default router;
