// Função serverless da Vercel: todas as rotas são reescritas para cá (veja vercel.json).
import mongoose from "mongoose";
import { criarApp } from "../app.js";

// Reaproveita a conexão entre execuções da função.
globalThis.__todoConexao ??= mongoose.connect(process.env.MONGODB_URI);
await globalThis.__todoConexao;

export default criarApp();
