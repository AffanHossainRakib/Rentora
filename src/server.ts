import app from "./app";
import config from "./config";

const PORT = config.port;

async function main() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port:`, PORT);
    });
  } catch (error: any) {
    console.error("Error starting the server:", error);
  }
}
main();
