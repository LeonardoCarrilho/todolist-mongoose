# ✅ TodoList com Node.js e Mongoose

Lista de tarefas com várias listas personalizadas, feita com **Node.js, Express, EJS, MongoDB e Mongoose**.

## Funcionalidades
- Lista padrão "hoje" criada com itens de boas-vindas
- Adicionar, concluir e excluir tarefas
- Listas personalizadas pela URL com **parâmetros de rota** (`/compras-do-mes`, `/trabalho`...)
- Itens como subdocumentos do Mongoose; exclusão com `$pull`
- Testes de integração com banco em memória (`mongodb-memory-server`)

## Como rodar
Precisa de um MongoDB local ou no Atlas.
```bash
npm install
MONGODB_URI="mongodb://127.0.0.1:27017/todolist" npm start
```
Acesse http://localhost:3000

Testes (não precisam de MongoDB instalado): `npm test`

Projeto do módulo 40 do curso Full Stack Turbo (TipsCode).
