// database.ts - Modificado para usar AWS DynamoDB
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DatabaseConfigDynamo {
  private static client: DynamoDBDocumentClient;

  public static getClient(): DynamoDBDocumentClient {
    if (!this.client) {
      try {
        console.log("Initializing DynamoDB client...");

        const config: any = {
          region: process.env.AWS_REGION || "us-east-1",
        };

        // Solo usar configuración local si está explícitamente habilitada
        if (process.env.USE_LOCAL_DYNAMODB === "true") {
          console.log("Using local DynamoDB configuration");
          config.endpoint = "http://localhost:8000";
          config.credentials = {
            accessKeyId: "fake",
            secretAccessKey: "fake",
          };
        } else {
          console.log("Using AWS DynamoDB configuration");
          // Para AWS, las credenciales se toman de:
          // 1. Variables de entorno (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
          // 2. IAM Roles (si está en EC2/Lambda)
          // 3. AWS Shared Credentials File (~/.aws/credentials)
        }

        const dynamoClient = new DynamoDBClient(config);

        this.client = DynamoDBDocumentClient.from(dynamoClient, {
          marshallOptions: {
            convertEmptyValues: false,
            removeUndefinedValues: true,
            convertClassInstanceToMap: false,
          },
          unmarshallOptions: {
            wrapNumbers: false,
          },
        });

        console.log("DynamoDB client initialized successfully");
      } catch (error) {
        console.error("Failed to initialize DynamoDB client:", error);
        throw error;
      }
    }
    return this.client;
  }
}