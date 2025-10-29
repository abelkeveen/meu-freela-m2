const AuthService = require("../services/authService");

module.exports = {
  register: (req, res) => AuthService.register(req, res),
  login: (req, res) => AuthService.login(req, res),
};
