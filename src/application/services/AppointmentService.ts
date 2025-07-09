// application/services/AppointmentService.ts
import { IAppointmentRepository } from "../../infrastructure/repositories/interfaces/IAppointmentRepository";
import {
  Appointment,
  CreateAppointmentRequest,
  AppointmentStatus,
} from "../../domain/entities/Appointment";
import { v4 as uuidv4 } from "uuid";

export class AppointmentService {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async createAppointment(
    request: CreateAppointmentRequest
  ): Promise<Appointment> {
    // Validación básica (puedes usar Zod aquí)
    if (request.insuredId.length !== 5 || !/^\d+$/.test(request.insuredId)) {
      throw new Error("insuredId debe ser de 5 dígitos");
    }

    const appointment: Appointment = {
      ...request,
      status: AppointmentStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    return await this.appointmentRepository.create(appointment);
  }

  async getAppointmentsByInsuredId(insuredId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.findByInsuredId(insuredId);
  }

  // async completeAppointment(
  //   insuredId: string,
  //   scheduleId: number
  // ): Promise<Appointment | null> {
  //   return await this.appointmentRepository.updateStatus(
  //     insuredId,
  //     scheduleId,
  //     AppointmentStatus.COMPLETED
  //   );
  // }
  // En tu AppointmentService
  async completeAppointment(
    insuredId: string,
    scheduleId: number
  ): Promise<Appointment | null> {
    return await this.appointmentRepository.updateStatus(
      insuredId,
      scheduleId,
      AppointmentStatus.COMPLETED
    );
  }
}
