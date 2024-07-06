const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const { log } = require("console");
const usuarios = require("./routes/usuarios");
require("./models/Postagem");
require("./models/Categoria");
const passport = require("passport");
require("./config/auth")(passport);

const Categoria = mongoose.model("Categorias");
const Postagem = mongoose.model("Postagens");

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

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
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
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect("/");
    });
});

app.use("/admin", admin);

app.use("/usuarios", usuarios);

// Outros
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
