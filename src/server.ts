import dotenv from "dotenv";

import app from "./app.js";

import { initDB } from "./db/initDB.js";

dotenv.config({quiet: true});

const PORT = process.env.PORT

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server failed:", error);
  }
};

startServer();