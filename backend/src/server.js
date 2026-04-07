const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./../common/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
      try {
            await connectDB();

            app.listen(PORT, () => {
                  logger.info(`🚀 Server running on port ${PORT}`);
                  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
            });

      } catch (error) {
            logger.error('❌ Failed to start server:', error);
            process.exit(1);
      }
};

startServer();