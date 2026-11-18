import express from "express";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Lista, obterLista, normalizar } from "./modelos.js";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const LISTA_PADRAO = "hoje";

export function criarApp() {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(raiz, "views"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(raiz, "public")));

  const urlDa = (nome) => (nome === LISTA_PADRAO ? "/" : `/${nome}`);
  const tentar = (fn) => (req, res, next) => fn(req, res, next).catch(next);

  const mostrar = (nome) => async (req, res) => {
    const lista = await obterLista(nome);
    const listas = await Lista.find({}, "nome").sort("nome").lean();
    res.render("lista", { lista, listas: listas.map((l) => l.nome), urlDa });
  };

  app.get("/", tentar(mostrar(LISTA_PADRAO)));

  // Nova lista personalizada a partir do formulário da barra lateral
  app.post("/listas", (req, res) => {
    const nome = normalizar(req.body.nome || "");
    res.redirect(nome ? urlDa(nome) : "/");
  });

  // Adicionar item
  app.post("/:lista/itens", tentar(async (req, res) => {
    const nome = normalizar(req.params.lista);
    const texto = (req.body.item || "").trim();
    if (texto) await Lista.updateOne({ nome }, { $push: { itens: { nome: texto } } });
    res.redirect(urlDa(nome));
  }));

  // Marcar/desmarcar item
  app.post("/:lista/itens/:id/alternar", tentar(async (req, res) => {
    const nome = normalizar(req.params.lista);
    const lista = await Lista.findOne({ nome });
    const item = lista?.itens.id(req.params.id);
    if (item) {
      item.feito = !item.feito;
      await lista.save();
    }
    res.redirect(urlDa(nome));
  }));

  // Excluir item ($pull no array de itens)
  app.post("/:lista/itens/:id/excluir", tentar(async (req, res) => {
    const nome = normalizar(req.params.lista);
    if (mongoose.isValidObjectId(req.params.id)) {
      await Lista.updateOne({ nome }, { $pull: { itens: { _id: req.params.id } } });
    }
    res.redirect(urlDa(nome));
  }));

  // Excluir lista personalizada
  app.post("/:lista/excluir", tentar(async (req, res) => {
    const nome = normalizar(req.params.lista);
    if (nome !== LISTA_PADRAO) await Lista.deleteOne({ nome });
    res.redirect("/");
  }));

  // Lista personalizada por parâmetro de rota
  app.get("/:lista", tentar(async (req, res, next) => {
    if (req.params.lista === "favicon.ico") return res.status(204).end();
    const nome = normalizar(req.params.lista);
    if (!nome) return res.redirect("/");
    if (nome !== req.params.lista) return res.redirect(urlDa(nome));
    return mostrar(nome)(req, res, next);
  }));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Erro interno. Tente novamente.");
  });
  return app;
}
