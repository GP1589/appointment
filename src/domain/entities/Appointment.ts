// domain/entities/Appointment.ts
export enum AppointmentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export enum CountryISO {
  PE = "PE",
  CL = "CL",
}

export interface Appointment {
  insuredId: string; // PK en DynamoDB (5 dígitos)
  scheduleId: number; // SK en DynamoDB
  status: AppointmentStatus;
  countryISO: "PE" | "CL";
  createdAt: string; // ISO date
  scheduleData: {
    centerId: number;
    specialtyId: number;
    medicId: number;
    date: string; // ISO date
  };
}

export interface CreateAppointmentRequest {
  insuredId: string;
  scheduleId: number; // scheduleId
  countryISO: "PE" | "CL";
  scheduleData: {
    centerId: number;
    specialtyId: number;
    medicId: number;
    date: string;
  };
}


// // Appointment.ts
// // Tabla dynamo
// export interface Appointment {
//   insuredId: string; //hash
//   scheduleId: number; //range
//   status: string;
//   countryISO: string;
//   createdAt: Date;
// }

// export interface ScheduleData {
//   centerId: number;
//   specialtyId: number;
//   medicId: number;
//   date: Date;
// }

// import { z } from "zod";

// export const CreateAppointmentRequest = z.object({
//   insuredId: z.string().length(5).regex(/^\d+$/), // 5 dígitos
//   scheduled: z.number().positive(),
//   countryISO: z.enum(["PE", "CL"]),
//   scheduleData: z.object({
//     centerId: z.number(),
//     specialtyId: z.number(),
//     medicId: z.number(),
//     date: z.string().datetime(), // ISO 8601
//   }),
// });
