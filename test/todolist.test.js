import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { criarApp } from "../app.js";
import { Lista } from "../modelos.js";

let mongo, servidor, base;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await new Promise((ok) => (servidor = criarApp().listen(0, ok)));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(async () => {
  servidor.close();
  await mongoose.disconnect();
  await mongo.stop();
});

const post = (caminho, dados = {}) =>
  fetch(base + caminho, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(dados),
    redirect: "manual",
  });

test("lista padrão é criada com itens iniciais", async () => {
  const html = await (await fetch(base)).text();
  assert.match(html, /Bem-vindo/);
  assert.equal((await Lista.findOne({ nome: "hoje" })).itens.length, 3);
});

test("adiciona, conclui e exclui item", async () => {
  await post("/hoje/itens", { item: "Estudar Mongoose" });
  let lista = await Lista.findOne({ nome: "hoje" });
  const item = lista.itens.find((i) => i.nome === "Estudar Mongoose");
  assert.ok(item);

  await post(`/hoje/itens/${item._id}/alternar`);
  lista = await Lista.findOne({ nome: "hoje" });
  assert.equal(lista.itens.id(item._id).feito, true);

  const r = await post(`/hoje/itens/${item._id}/excluir`);
  assert.equal(r.headers.get("location"), "/");
  lista = await Lista.findOne({ nome: "hoje" });
  assert.equal(lista.itens.id(item._id), null);
});

test("listas personalizadas por parâmetro de rota", async () => {
  const r = await post("/listas", { nome: "Compras do Mês" });
  assert.equal(r.headers.get("location"), "/compras-do-mes");
  assert.equal((await fetch(`${base}/compras-do-mes`)).status, 200);

  await post("/compras-do-mes/itens", { item: "Café" });
  const compras = await Lista.findOne({ nome: "compras-do-mes" });
  assert.ok(compras.itens.some((i) => i.nome === "Café"));
  const hoje = await Lista.findOne({ nome: "hoje" });
  assert.ok(!hoje.itens.some((i) => i.nome === "Café"));

  await post("/compras-do-mes/excluir");
  assert.equal(await Lista.findOne({ nome: "compras-do-mes" }), null);
});

test("ids inválidos não derrubam o servidor", async () => {
  assert.equal((await post("/hoje/itens/xyz/excluir")).status, 302);
  assert.equal((await post("/hoje/itens/xyz/alternar")).status, 302);
});
