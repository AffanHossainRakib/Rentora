import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function main() {
  try {
    app.listen(PORT, async () => {
      await prisma.$connect();
      console.log("Connected to the database successfully.");

      console.log(`Server is running on port:`, PORT);
    });
  } catch (error: any) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (config.node_env !== "production") {
  main();
}
