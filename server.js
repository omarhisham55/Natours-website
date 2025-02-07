const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  //.connect(process.env.DATABASE_LOCAL) // for local db
  .connect(DB)
  .then(() => {});
// .catch((err) => console.log(err.message));

const dbLogs = mongoose.connection;
dbLogs.on("connected", () => console.log("DB connection successful!"));
//? dbLogs.on("error", (err) => console.log(`DB connection error: ${err.message}`));
dbLogs.on("disconnected", () => console.log("DB disconnected!"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`app running at http://localhost:${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
