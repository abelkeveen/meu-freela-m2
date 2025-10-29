// Rotas de pagamentos
const express = require("express");
const router = express.Router();
const PaymentsController = require("../controllers/paymentsController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", PaymentsController.list);
router.post("/", PaymentsController.create);
router.get("/summary", PaymentsController.summary);

module.exports = router;
