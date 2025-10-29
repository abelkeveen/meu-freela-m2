// Rotas de jobs
const express = require("express");
const router = express.Router();
const JobsController = require("../controllers/jobsController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", JobsController.list);
router.post("/", JobsController.create);
router.get("/:id", JobsController.get);
router.put("/:id", JobsController.update);
router.delete("/:id", JobsController.remove);

module.exports = router;
