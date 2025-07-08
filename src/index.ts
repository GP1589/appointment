import { App } from './api/app';
import { config } from './infrastructure/config/environment';

const startServer = (): void => {
  const app = new App();
  const server = app.getApp();

  server.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🗃️  DynamoDB Table: ${config.tableName}`);
    console.log(`🌍 AWS Region: ${config.awsRegion}`);
  });
};

startServer();