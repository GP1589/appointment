import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { App } from './api/app';
import serverless from 'serverless-http';

// Inicializar la app una sola vez (fuera del handler)
const app = new App();
const serverlessApp = serverless(app.getApp(), {
  binary: false,
  request: (request: any, event: APIGatewayProxyEvent, context: Context) => {
    // Agregar información del evento Lambda al request
    request.event = event;
    request.context = context;
  }
});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Lambda event:', JSON.stringify(event, null, 2));
  
  try {
    // Procesar la petición a través del proxy
    const result = await serverlessApp(event, context);
    
    console.log('Lambda response:', JSON.stringify(result, null, 2));
    return result as APIGatewayProxyResult;
  } catch (error) {
    console.error('Lambda error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { 
            details: error instanceof Error ? error.message : String(error) 
          })
        }
      })
    };
  }
};