const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const clientsRoutes = require("./routes/clients");
const jobsRoutes = require("./routes/jobs");
const paymentsRoutes = require("./routes/payments");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../recursos/swagger.json");

const app = express();
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/clients", clientsRoutes);
app.use("/jobs", jobsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", (req, res) => res.send("API Meu Freela rodando!"));

module.exports = app;
