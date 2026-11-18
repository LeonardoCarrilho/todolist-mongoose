import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, maxlength: 120 },
  feito: { type: Boolean, default: false },
});

const listaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true, lowercase: true, trim: true },
  itens: [itemSchema],
});

export const Lista = mongoose.models.Lista || mongoose.model("Lista", listaSchema);

export const ITENS_PADRAO = [
  { nome: "Bem-vindo à sua lista de tarefas!" },
  { nome: "Use o + para adicionar uma tarefa." },
  { nome: "← Marque a caixa para concluir ou clique em × para excluir." },
];

// Nome de lista seguro para URL: "Compras do Mês" -> "compras-do-mes"
export const normalizar = (nome) =>
  nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export async function obterLista(nome) {
  return (
    (await Lista.findOne({ nome })) ??
    (await Lista.findOneAndUpdate(
      { nome },
      { $setOnInsert: { nome, itens: ITENS_PADRAO } },
      { upsert: true, new: true }
    ))
  );
}
