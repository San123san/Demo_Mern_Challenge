import dotenv from 'dotenv'
import connectDB from "./db/server.js"
import { initializeInformation } from './controllers/transactionalInformation.controller.js'
import { app } from "./app.js"
dotenv.config({
  path:'./.env'
})

const startServer = async () => {
  try {
      // Establish database connection
      await connectDB();

      // Initialize the database
      await initializeInformation();

      // Start the Express server
      app.listen(process.env.PORT || 8000, () => {
          console.log(`Server is running at port: ${process.env.PORT || 8000}`);
      });
  } catch (err) {
      console.error("Error during server startup:", err);
  }
};

startServer();