const AuthService = require("../services/authService");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Token não fornecido." });
  const token = authHeader.split(" ")[1];
  const user = AuthService.verifyToken(token);
  if (!user) return res.status(401).json({ error: "Token inválido." });
  req.user = user;
  next();
};
