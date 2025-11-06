const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./recursos/swagger.json");
const authRoutes = require("./src/routes/auth");
const clientsRoutes = require("./src/routes/clients");
const jobsRoutes = require("./src/routes/jobs");
const paymentsRoutes = require("./src/routes/payments");

app.use(express.json());
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/clients", clientsRoutes);
app.use("/jobs", jobsRoutes);
app.use("/payments", paymentsRoutes);

module.exports = app; // exporte o app para os testes

// Só rode o servidor se não estiver em ambiente de teste
if (require.main === module) {
  app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
}
