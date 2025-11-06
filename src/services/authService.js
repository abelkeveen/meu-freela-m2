const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { users } = require("../models/db");
const SECRET = "supersecret";

module.exports = {
  register: (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha)
      return res.status(400).json({ error: "Login e senha obrigatórios." });
    if (users.find((u) => u.login === login))
      return res.status(409).json({ error: "Usuário já existe." });
    const hash = bcrypt.hashSync(senha, 8);
    users.push({ id: users.length + 1, login, senha: hash });
    res.status(201).json({ login });
  },
  login: (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ error: "Login e senha obrigatórios." });
    }
    const user = users.find((u) => u.login === login);
    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado." });
    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: "Senha incorreta." });
    const token = jwt.sign({ id: user.id, login: user.login }, SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  },
  verifyToken: (token) => {
    try {
      return jwt.verify(token, SECRET);
    } catch {
      return null;
    }
  },
};
