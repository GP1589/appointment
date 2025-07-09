import { Router } from "express";
import { AppointmentController } from "../../application/controllers/AppointmentController";

export const createAppointmentRoutes = (
  appointmentController: AppointmentController
): Router => {
  const router = Router();

  /**
   * @swagger
   * /appointment/create:
   *   post:
   *     tags:
   *       - Appointments
   *     summary: Create a new appointment
   *     description: Creates a new medical appointment
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AppointmentRequest'
   *     responses:
   *       200:
   *         description: Appointment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   */
  router.post("/create", appointmentController.createAppointment);

  /**
   * @swagger
   * /appointment/getAppointmentsByInsuredId/{insuredId}:
   *   get:
   *     tags:
   *       - Appointments
   *     summary: Get appointments by insured ID
   *     description: Returns all appointments for a specific insured person
   *     parameters:
   *       - in: path
   *         name: insuredId
   *         schema:
   *           type: string
   *           pattern: '^[0-9]{5}'
   *         required: true
   *         description: 5-digit insured person ID
   *         example: "00011"
   *     responses:
   *       200:
   *         description: List of appointments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Appointment'
   *       404:
   *         description: No appointments found for the given insured ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   */
  router.get(
    "/getAppointmentsByInsuredId/:insuredId",
    appointmentController.getAppointmentsByInsuredId
  );

  return router;
};

