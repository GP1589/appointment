// tests/unit/controllers/AppointmentController.test.ts
import { AppointmentController } from "../../../src/application/controllers/AppointmentController";
import { AppointmentService } from "../../../src/application/services/AppointmentService";
import { ResponseBuilder } from "../../../src/transversal/common/ResponseBase";
import {
  AppointmentStatus,
  CountryISO,
} from "../../../src/domain/entities/Appointment";

describe("AppointmentController", () => {
  let mockAppointmentService: jest.Mocked<AppointmentService>;
  let appointmentController: AppointmentController;

  beforeEach(() => {
    mockAppointmentService = {
      createAppointment: jest.fn(),
      getAppointmentsByInsuredId: jest.fn(),
      completeAppointment: jest.fn(),
    } as any;

    appointmentController = new AppointmentController(mockAppointmentService);
  });

  describe("createAppointment", () => {
    it("should return 400 if required fields are missing", async () => {
      const req = { body: {} } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.createAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isSuccess: false,
          message: "Faltan campos requeridos",
          errorCode: "BAD_REQUEST", // Cambiado de 'error' a 'errorCode'
          data: null,
        })
      );
    });

    it("should call service and return 201 on success", async () => {
      const request = {
        insuredId: "12345",
        scheduleId: 1,
        countryISO: "CL" as CountryISO,
        scheduleData: {
          centerId: 2,
          specialtyId: 8,
          medicId: 4,
          date: "2024-09-30T12:30:00Z",
        },
      };
      const mockAppointment = {
        ...request,
        status: AppointmentStatus.PENDING,
        createdAt: new Date().toISOString(),
      };

      mockAppointmentService.createAppointment.mockResolvedValue(
        mockAppointment
      );

      const req = { body: request } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.createAppointment(req, res, next);

      expect(mockAppointmentService.createAppointment).toHaveBeenCalledWith(
        request
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isSuccess: true,
          data: mockAppointment,
          message: "Cita agendada en proceso",
        })
      );
    });

    it("should call next with error if service throws", async () => {
      const request = {
        insuredId: "12345",
        scheduleId: 1,
        countryISO: "CL" as CountryISO,
        scheduleData: {
          centerId: 2,
          specialtyId: 8,
          medicId: 4,
          date: "2024-09-30T12:30:00Z",
        },
      };
      const error = new Error("Service error");

      mockAppointmentService.createAppointment.mockRejectedValue(error);

      const req = { body: request } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.createAppointment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAppointmentsByInsuredId", () => {
    it("should return 400 if insuredId is invalid", async () => {
      const req = { params: { insuredId: "123" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.getAppointmentsByInsuredId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isSuccess: false,
          message: "insuredId debe ser de 5 dígitos",
          errorCode: "BAD_REQUEST", // Cambiado de 'error' a 'errorCode'
          data: null,
        })
      );
    });

    it("should call service and return appointments", async () => {
      const insuredId = "12345";
      const mockAppointments = [
        {
          insuredId,
          scheduleId: 1,
          countryISO: "CL" as CountryISO,
          status: AppointmentStatus.PENDING,
          createdAt: new Date().toISOString(),
          scheduleData: {
            centerId: 2,
            specialtyId: 8,
            medicId: 4,
            date: "2024-09-30T12:30:00Z",
          },
        },
      ];

      mockAppointmentService.getAppointmentsByInsuredId.mockResolvedValue(
        mockAppointments
      );

      const req = { params: { insuredId } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.getAppointmentsByInsuredId(req, res, next);

      expect(
        mockAppointmentService.getAppointmentsByInsuredId
      ).toHaveBeenCalledWith(insuredId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isSuccess: true,
          data: mockAppointments,
          message: "Citas recuperadas",
        })
      );
    });

    it("should call next with error if service throws", async () => {
      const insuredId = "12345";
      const error = new Error("Service error");

      mockAppointmentService.getAppointmentsByInsuredId.mockRejectedValue(
        error
      );

      const req = { params: { insuredId } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      await appointmentController.getAppointmentsByInsuredId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
