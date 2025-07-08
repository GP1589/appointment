import {
  Appointment,
  CreateAppointmentRequest,
  AppointmentStatus,
} from "../../../domain/entities/Appointment";

export interface IAppointmentRepository {
  create(appointment: CreateAppointmentRequest): Promise<Appointment>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  updateStatus(
    insuredId: string,
    scheduleId: number,
    status: AppointmentStatus
  ): Promise<Appointment | null>;
}
