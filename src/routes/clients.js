// Rotas de clientes
const express = require("express");
const router = express.Router();
const ClientsController = require("../controllers/clientsController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", ClientsController.list);
router.post("/", ClientsController.create);
router.get("/:id", ClientsController.get);
router.put("/:id", ClientsController.update);
router.delete("/:id", ClientsController.remove);

module.exports = router;
