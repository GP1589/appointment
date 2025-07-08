import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "../api/middlewares/errorHandler";
import { requestLogger } from "../api/middlewares/requestLogger";
import { AppointmentController } from "../application/controllers/AppointmentController";
import { AppointmentService } from "../application/services/AppointmentService";
import { AppointmentRepository } from "../infrastructure/repositories/implementation/AppointmentRepository";
import { createAppointmentRoutes } from "./routes/appointmentRoutes";


export class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupDependencies();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private appointmentController!: AppointmentController;

  private setupDependencies(): void {


    const appointmentRepository = new AppointmentRepository();
    const appointmentService = new AppointmentService(appointmentRepository);
    const appointmentController = new AppointmentController(appointmentService);
    this.appointmentController = appointmentController;}

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    this.app.use(
      "/appointment",
      createAppointmentRoutes(this.appointmentController)
    );

    // Ruta no encontrada (último recurso)
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: "Endpoint not found",
          path: req.originalUrl,
          method: req.method,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }
}
