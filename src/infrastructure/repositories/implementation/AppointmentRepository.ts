
import { IAppointmentRepository } from "../interfaces/IAppointmentRepository";
import {
  Appointment,
  CreateAppointmentRequest,
  AppointmentStatus,
} from "../../../domain/entities/Appointment";
import { DynamoDB, SNS } from "aws-sdk";

export class AppointmentRepository implements IAppointmentRepository {
  private dynamoDb: DynamoDB.DocumentClient;
  private sns: SNS;
  private tableName: string;
  private snsTopicArn: string;

  constructor() {
    this.dynamoDb = new DynamoDB.DocumentClient();
    this.sns = new SNS();
    this.tableName = process.env.APPOINTMENTS_TABLE!;
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

    // 2. Publicar en SNS con el atributo countryISO
    await this.sns
      .publish({
        TopicArn: this.snsTopicArn,
        Message: JSON.stringify(newAppointment),
        MessageAttributes: {
          countryISO: {
            DataType: "String",
            StringValue: newAppointment.countryISO, // "PE" o "CL"
          },
        },
      })
      .promise();

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

// import { IAppointmentRepository } from "../interfaces/IAppointmentRepository";
// import {
//   Appointment,
//   CreateAppointmentRequest,
//   AppointmentStatus,
// } from "../../../domain/entities/Appointment";
// import { DynamoDB } from "aws-sdk";

// export class AppointmentRepository implements IAppointmentRepository {
//   private dynamoDb: DynamoDB.DocumentClient;
//   private tableName: string;

//   constructor() {
//     this.dynamoDb = new DynamoDB.DocumentClient();
//     // this.tableName = process.env.APPOINTMENTS_TABLE!;
//     this.tableName = "appointment";
//   }

//   async create(appointment: CreateAppointmentRequest): Promise<Appointment> {
//     const newAppointment: Appointment = {
//       ...appointment,
//       status: AppointmentStatus.PENDING,
//       createdAt: new Date().toISOString(),
//     };

//     await this.dynamoDb
//       .put({
//         TableName: this.tableName,
//         Item: newAppointment,
//       })
//       .promise();

//     return newAppointment;
//   }

//   async findByInsuredId(insuredId: string): Promise<Appointment[]> {
//     const result = await this.dynamoDb
//       .query({
//         TableName: this.tableName,
//         KeyConditionExpression: "insuredId = :insuredId",
//         ExpressionAttributeValues: { ":insuredId": insuredId },
//       })
//       .promise();

//     return result.Items as Appointment[];
//   }

//   async updateStatus(
//     insuredId: string,
//     scheduleId: number,
//     status: AppointmentStatus
//   ): Promise<Appointment | null> {
//     const result = await this.dynamoDb
//       .update({
//         TableName: this.tableName,
//         Key: { insuredId, scheduleId },
//         UpdateExpression: "SET #status = :status",
//         ExpressionAttributeNames: { "#status": "status" },
//         ExpressionAttributeValues: { ":status": status },
//         ReturnValues: "ALL_NEW",
//       })
//       .promise();

//     return result.Attributes as Appointment | null;
//   }
// }
