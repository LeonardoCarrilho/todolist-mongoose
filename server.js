import mongoose from "mongoose";
import { criarApp } from "./app.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todolist";
const porta = process.env.PORT || 3000;

await mongoose.connect(uri);
console.log("Conectado ao MongoDB");
criarApp().listen(porta, () => console.log(`TodoList em http://localhost:${porta}`));
