require("dotenv").config();
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
// Normalize Port for Deployment
const PORT = process.env.PORT || 3000;
const uploadFileRoute = require("./apiRoute");
const NormalizePort = (port) => {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) {
    return port;
  }
  if (parsedPort >= 0) {
    return parsedPort;
  }
  return false;
};

// Setup server port
const port = NormalizePort(PORT);

// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
      extended: true,
      limit: "500mb",
  })
);

// Enable CORS
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));
app.use(multer().any());

// Set development server
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Set production server
if (process.env.NODE_ENV === "production") {
  const helmet = require("helmet");
  app.use(helmet());
}

// Set base route
app.use("/api", uploadFileRoute);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
