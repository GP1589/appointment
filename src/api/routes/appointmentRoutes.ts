import { Router } from "express";
import { AppointmentController } from "../../application/controllers/AppointmentController";

export const createAppointmentRoutes = (
  appointmentController: AppointmentController
): Router => {
  const router = Router();

  router.post("/create", appointmentController.createAppointment);
  router.get("/getAppointmentsByInsuredId", appointmentController.getAppointmentsByInsuredId);

  return router;
};
