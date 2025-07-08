// presentation/controllers/AppointmentController.ts
import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../../application/services/AppointmentService";
import { CreateAppointmentRequest } from "../../domain/entities/Appointment";
import { ResponseBuilder } from "../../transversal/common/ResponseBase";

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  createAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const request: CreateAppointmentRequest = req.body;

      // Validación con Zod (ejemplo simplificado)
      if (!request.insuredId || !request.scheduleId || !request.countryISO) {
        ResponseBuilder.badRequest(res, "Faltan campos requeridos");
        return;
      }

      const appointment = await this.appointmentService.createAppointment(
        request
      );
      ResponseBuilder.created(res, appointment, "Cita agendada en proceso");
    } catch (error) {
      next(error);
    }
  };

  getAppointmentsByInsuredId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { insuredId } = req.params;

      if (!insuredId || insuredId.length !== 5) {
        ResponseBuilder.badRequest(res, "insuredId debe ser de 5 dígitos");
        return;
      }

      const appointments =
        await this.appointmentService.getAppointmentsByInsuredId(insuredId);
      ResponseBuilder.success(res, appointments, "Citas recuperadas");
    } catch (error) {
      next(error);
    }
  };

  
}
