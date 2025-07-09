import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Appointment API",
      version: "1.0.0",
      description: "API for managing appointments",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://3nynf5zwrg.execute-api.us-east-1.amazonaws.com/Stage",
        description: "Production server (AWS API Gateway)",
      },
    ],
    components: {
      schemas: {
        ScheduleData: {
          type: "object",
          required: ["centerId", "specialtyId", "medicId", "date"],
          properties: {
            centerId: {
              type: "integer",
              description: "Medical center identifier",
              example: 2,
            },
            specialtyId: {
              type: "integer",
              description: "Medical specialty identifier",
              example: 8,
            },
            medicId: {
              type: "integer",
              description: "Doctor identifier",
              example: 4,
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Appointment date and time in ISO format",
              example: "2024-09-30T12:30:00Z",
            },
          },
        },
        AppointmentRequest: {
          type: "object",
          required: [
            "insuredId",
            "scheduleId",
            "status",
            "countryISO",
            "scheduleData",
          ],
          properties: {
            insuredId: {
              type: "string",
              pattern: "^[0-9]{5}",
              description:
                "Insured person code (5 digits, can have leading zeros)",
              example: "00012",
            },
            scheduleId: {
              type: "integer",
              description: "Schedule space identifier",
              example: 16,
            },
            status: {
              type: "string",
              enum: ["pending", "completed"],
              description: "Appointment status",
              example: "pending",
            },
            countryISO: {
              type: "string",
              enum: ["PE", "CL"],
              description: "Country ISO code (only PE or CL)",
              example: "CL",
            },
            scheduleData: {
              $ref: "#/components/schemas/ScheduleData",
            },
          },
        },
        Appointment: {
          type: "object",
          required: [
            "id",
            "insuredId",
            "scheduleId",
            "status",
            "countryISO",
            "scheduleData",
            "createdAt",
          ],
          properties: {
            id: {
              type: "string",
              description: "Unique appointment identifier",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            insuredId: {
              type: "string",
              description: "Insured person code",
              example: "00012",
            },
            scheduleId: {
              type: "integer",
              description: "Schedule space identifier",
              example: 16,
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "failed"],
              description: "Appointment status",
              example: "pending",
            },
            countryISO: {
              type: "string",
              enum: ["PE", "CL"],
              description: "Country ISO code",
              example: "CL",
            },
            scheduleData: {
              $ref: "#/components/schemas/ScheduleData",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Appointment creation timestamp",
              example: "2024-07-09T10:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Appointment last update timestamp",
              example: "2024-07-09T10:30:00Z",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Appointment is being processed",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Invalid request data",
                },
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./routes/*.ts",
    "./src/api/routes/*.ts",
    "./dist/api/routes/*.js",
  ], // Ruta a tus archivos de rutas
};


const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  // Configuración específica para Lambda
  const swaggerUiAssetPath = require("swagger-ui-dist/absolute-path");

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Medical Appointment API Documentation",
      swaggerOptions: {
        // Configuración para manejar CORS en API Gateway
        requestInterceptor: (req: any) => {
          req.headers["Accept"] = "application/json";
          return req;
        },
        // Configuración para manejar la URL base en API Gateway
        url: undefined,
        urls: [
          {
            url: "/api-docs.json",
            name: "API Documentation",
          },
        ],
      },
    })
  );

  // Endpoint para obtener la especificación en formato JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.send(specs);
  });

  // Endpoint de health check para la documentación
  app.get("/api-docs/health", (req, res) => {
    res.json({
      status: "OK",
      message: "Swagger documentation is running",
      timestamp: new Date().toISOString(),
    });
  });

  const isLocal =
    process.env.NODE_ENV === "development" ||
    process.env.AWS_EXECUTION_ENV === undefined;

  if (isLocal) {
    console.log(
      "📚 Swagger documentation available at: http://localhost:5000/api-docs"
    );
  } else {
    console.log(
      "📚 Swagger documentation available at: https://3nynf5zwrg.execute-api.us-east-1.amazonaws.com/Stage/api-docs"
    );
  }
};



// const specs = swaggerJSDoc(options);

// export const setupSwagger = (app: Application): void => {
//   app.use(
//     "/api-docs",
//     swaggerUi.serve,
//     swaggerUi.setup(specs, {
//       explorer: true,
//       customCss: ".swagger-ui .topbar { display: none }",
//       customSiteTitle: "Appointment API Documentation",
//     })
//   );

//   // Endpoint para obtener la especificación en formato JSON
//   app.get("/api-docs.json", (req, res) => {
//     res.setHeader("Content-Type", "application/json");
//     res.send(specs);
//   });

//   console.log(
//     "📚 Swagger documentation available at: http://localhost:5000/api-docs"

//   );
//   console.log(
//     "📚 Swagger documentation available at: https://3nynf5zwrg.execute-api.us-east-1.amazonaws.com/Stage/api-docs"
//   );
// };
