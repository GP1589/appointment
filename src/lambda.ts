import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  SQSEvent,
} from "aws-lambda";
import { App } from "./api/app";
import serverless from "serverless-http";
import { AppointmentService } from "./application/services/AppointmentService";
import { AppointmentRepository } from "./infrastructure/repositories/implementation/AppointmentRepository";
import { AppointmentStatus } from "./domain/entities/Appointment";

// Inicializar dependencias una sola vez (fuera del handler)
const appointmentRepository = new AppointmentRepository();
const appointmentService = new AppointmentService(appointmentRepository);

// Inicializar la app para HTTP
const app = new App();
const serverlessApp = serverless(app.getApp(), {
  binary: false,
  request: (request: any, event: APIGatewayProxyEvent, context: Context) => {
    request.event = event;
    request.context = context;
  },
});

async function handleSqsEvent(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      console.log("Processing SQS message:", messageBody);

      // Asume que el mensaje contiene insuredId y scheduleId
      const { insuredId, scheduleId } = messageBody;

      await appointmentService.completeAppointment(insuredId, scheduleId);
      console.log(
        `Appointment completed for insured ${insuredId}, schedule ${scheduleId}`
      );
    } catch (error) {
      console.error("Error processing SQS message:", error);
      // Puedes decidir si quieres lanzar el error o continuar con los siguientes mensajes
    }
  }
}

export const handler = async (
  event: APIGatewayProxyEvent | SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult | void> => {
  console.log("Lambda event:", JSON.stringify(event, null, 2));

  try {
    // Determinar el tipo de evento
    if (
      "Records" in event &&
      event.Records.length > 0 &&
      "eventSource" in event.Records[0] &&
      event.Records[0].eventSource === "aws:sqs"
    ) {
      // Es un evento SQS
      await handleSqsEvent(event as SQSEvent);
      return;
    } else {
      // Es un evento HTTP (API Gateway)
      const result = await serverlessApp(
        event as APIGatewayProxyEvent,
        context
      );
      console.log("Lambda response:", JSON.stringify(result, null, 2));
      return result as APIGatewayProxyResult;
    }
  } catch (error) {
    console.error("Lambda error:", error);

    // Solo devolver respuesta de error si es una petición HTTP
    if (!("Records" in event)) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: "Internal server error",
            ...(process.env.NODE_ENV === "development" && {
              details: error instanceof Error ? error.message : String(error),
            }),
          },
        }),
      };
    }
    // Para eventos SQS, AWS Lambda ya maneja los reintentos según la configuración de la cola
    throw error;
  }
};

// import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
// import { App } from './api/app';
// import serverless from 'serverless-http';

// // Inicializar la app una sola vez (fuera del handler)
// const app = new App();
// const serverlessApp = serverless(app.getApp(), {
//   binary: false,
//   request: (request: any, event: APIGatewayProxyEvent, context: Context) => {
//     // Agregar información del evento Lambda al request
//     request.event = event;
//     request.context = context;
//   }
// });

// export const handler = async (
//   event: APIGatewayProxyEvent,
//   context: Context
// ): Promise<APIGatewayProxyResult> => {
//   console.log('Lambda event:', JSON.stringify(event, null, 2));

//   try {
//     // Procesar la petición a través del proxy
//     const result = await serverlessApp(event, context);

//     console.log('Lambda response:', JSON.stringify(result, null, 2));
//     return result as APIGatewayProxyResult;
//   } catch (error) {
//     console.error('Lambda error:', error);

//     return {
//       statusCode: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
//       },
//       body: JSON.stringify({
//         success: false,
//         error: {
//           message: 'Internal server error',
//           ...(process.env.NODE_ENV === 'development' && {
//             details: error instanceof Error ? error.message : String(error)
//           })
//         }
//       })
//     };
//   }
// };
