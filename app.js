const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");

// configs
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", handlebars({ default: true }));
app.set("view engine", "handlebars");

// Outros
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em https://localhost:${port}`);
});
