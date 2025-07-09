import { IAppointmentRepository } from "../interfaces/IAppointmentRepository";
import {
  Appointment,
  CreateAppointmentRequest,
  AppointmentStatus,
} from "../../../domain/entities/Appointment";
import { DynamoDB, SNS } from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

export class AppointmentRepository implements IAppointmentRepository {
  private dynamoDb: DynamoDB.DocumentClient;
  private sns: SNS;
  private tableName: string;
  private snsTopicArn: string;

  constructor() {
    this.dynamoDb = new DynamoDB.DocumentClient();
    this.sns = new SNS();
    this.tableName = process.env.TABLE_NAME!;
    console.log("📄 TABLE_NAME:", process.env.TABLE_NAME); // Agrega esto al constructor
    this.snsTopicArn = process.env.SNS_TOPIC_ARN!;
  }

  async create(appointment: CreateAppointmentRequest): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      status: AppointmentStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    // 1. Guardar en DynamoDB
    await this.dynamoDb
      .put({
        TableName: this.tableName,
        Item: newAppointment,
      })
      .promise();

    // 2. Publicar en SNS
    try {
      const snsResponse = await this.sns
        .publish({
          TopicArn: this.snsTopicArn,
          Message: JSON.stringify(newAppointment),
          MessageAttributes: {
            countryISO: {
              DataType: "String",
              StringValue: newAppointment.countryISO,
            },
          },
        })
        .promise();

      console.log("SNS Response:", snsResponse);
      // Verifica que tengas un MessageId en la respuesta
      if (!snsResponse.MessageId) {
        throw new Error("No se recibió MessageId de SNS");
      }
    } catch (error) {
      console.error("Error al publicar en SNS:", error);
      throw error; // O maneja el error según tu lógica de negocio
    }

    return newAppointment;
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const result = await this.dynamoDb
      .query({
        TableName: this.tableName,
        KeyConditionExpression: "insuredId = :insuredId",
        ExpressionAttributeValues: { ":insuredId": insuredId },
      })
      .promise();

    return result.Items as Appointment[];
  }

  async updateStatus(
    insuredId: string,
    scheduleId: number,
    status: AppointmentStatus
  ): Promise<Appointment | null> {
    const result = await this.dynamoDb
      .update({
        TableName: this.tableName,
        Key: { insuredId, scheduleId },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": status },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return result.Attributes as Appointment | null;
  }
}
