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

// Inicializar dependencias con logs
console.log("Initializing dependencies...");
const appointmentRepository = new AppointmentRepository();
console.log("AppointmentRepository initialized");
const appointmentService = new AppointmentService(appointmentRepository);
console.log("AppointmentService initialized");

// Inicializar la app para HTTP
console.log("Initializing Express app...");
const app = new App();
console.log("Express app initialized");

const serverlessApp = serverless(app.getApp(), {
  binary: false,
  request: (request: any, event: APIGatewayProxyEvent, context: Context) => {
    console.log("Serverless-http request preprocessing");
    request.event = event;
    request.context = context;
    console.log(
      `Request details - Path: ${event.path}, Method: ${event.httpMethod}`
    );
  },
});
console.log("Serverless-http wrapper configured");

async function handleSqsEvent(event: SQSEvent): Promise<void> {
  console.log(
    `Starting to process SQS event with ${event.Records.length} records`
  );

  for (const [index, record] of event.Records.entries()) {
    console.log(`Processing record ${index + 1}/${event.Records.length}`);
    console.log(
      `Record ID: ${record.messageId}, Event Source: ${record.eventSource}`
    );

    try {
      console.log("Raw message body:", record.body);
      const messageBody = JSON.parse(record.body);
      console.log("Parsed message body:", JSON.stringify(messageBody, null, 2));

      // Validar estructura del mensaje
      if (!messageBody.insuredId || !messageBody.scheduleId) {
        console.error("Invalid message format - missing required fields");
        throw new Error("Message must contain insuredId and scheduleId");
      }

      const { insuredId, scheduleId } = messageBody;
      console.log(
        `Starting to complete appointment for insured: ${insuredId}, schedule: ${scheduleId}`
      );

      const result = await appointmentService.completeAppointment(
        insuredId,
        scheduleId
      );
      console.log(
        `Appointment completed successfully. Result: ${JSON.stringify(result)}`
      );
    } catch (error) {
      console.error(`Error processing record ${index + 1}:`, error);
      console.error("Record that failed:", JSON.stringify(record, null, 2));

      // Puedes decidir si quieres lanzar el error o continuar con los siguientes mensajes
      // Para este ejemplo, continuamos con los siguientes mensajes pero lo registramos
    }
  }

  console.log("Finished processing all SQS records");
}

export const handler = async (
  event: APIGatewayProxyEvent | SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult | void> => {
  console.log("=== STARTING LAMBDA EXECUTION ===");
  console.log(
    "Lambda context:",
    JSON.stringify(
      {
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        invokedFunctionArn: context.invokedFunctionArn,
        awsRequestId: context.awsRequestId,
      },
      null,
      2
    )
  );

  console.log("Raw event received:", JSON.stringify(event, null, 2));

  try {
    // Determinar el tipo de evento
    if (
      "Records" in event &&
      event.Records.length > 0 &&
      "eventSource" in event.Records[0] &&
      event.Records[0].eventSource === "aws:sqs"
    ) {
      console.log("Detected SQS event type");
      console.log(`Number of SQS records: ${event.Records.length}`);

      await handleSqsEvent(event as SQSEvent);

      console.log("SQS event processing completed successfully");
      return;
    } else {
      console.log("Detected API Gateway event type");
      console.log(`HTTP Method: ${(event as APIGatewayProxyEvent).httpMethod}`);
      console.log(`Path: ${(event as APIGatewayProxyEvent).path}`);

      const result = await serverlessApp(
        event as APIGatewayProxyEvent,
        context
      );

      console.log("API Gateway processing completed");
      console.log("Response to be returned:", JSON.stringify(result, null, 2));

      return result as APIGatewayProxyResult;
    }
  } catch (error) {
    console.error("!!! ERROR IN LAMBDA HANDLER !!!");
    console.error(
      "Error details:",
      error instanceof Error ? error.stack : error
    );

    // Solo devolver respuesta de error si es una petición HTTP
    if (!("Records" in event)) {
      console.error("Returning HTTP 500 error response");

      const errorResponse = {
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

      console.log("Error response:", JSON.stringify(errorResponse, null, 2));
      return errorResponse;
    }

    console.error(
      "SQS event error - throwing to allow retry or DLQ processing"
    );
    throw error;
  } finally {
    console.log("=== LAMBDA EXECUTION COMPLETED ===");
  }
};
