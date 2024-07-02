const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

// configs
// Flash

// Resto
const app = express();

app.use(
  session({
    secret: "blogapp",
    resave: true,
    saveUnitialized: true,
  })
);
app.use(flash());

//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("sucess_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", handlebars.engine({ default: true }));
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log(`Conectado ao mongo`);
  })
  .catch((err) => {
    console.log(`Erro ao coectar, erro foi: ${err}`);
  });

// rotas
app.use("/admin", admin);

// Outros
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
