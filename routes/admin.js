const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");

const Categoria = mongoose.model("Categorias");

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/posts"),
  (req, res) => {
    res.send(`Página de posts`);
  };

router.get(`/categorias`, (req, res) => {
  Categoria.find()
    .lean()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", (req, res) => {
  const erros = [];

  if (
    !req.body.name ||
    (typeof req.body.nome == undefined) | (typeof req.body.nome == null)
  ) {
    erros.push({ texto: "Nome inválido" });
  }

  if (
    !req.body.slug ||
    (typeof req.body.slug == undefined) | (typeof req.body.slug == null)
  ) {
    erros.push({ testo: "Slug inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno" });
  }

  if (erros.length < 0) {
    res.render("admin/addCategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("sucess_msg", `Categoria criada com sucesso`);
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "ocorreu um erro ao salvar a categoria, tente novamente"
        );
        res.redirect("/admin");
      });
  }
});

router.get("/categorias/edit/:id", (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", (req, res) => {
  Categoria.findOne({ _id: req.body.id })

    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Huve um erro ao salvar a ediçao da categoria"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", (req, res) => {
  Categoria.findOneAndDelete({ _id: req.body.id })
    .then(() => {
      req.flash("sucess_msg", "Categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect("/admin/categorias");
    });
});

module.exports = router;
