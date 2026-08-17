import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler, rotaNaoEncontrada } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.use("/api", routes);

app.use(rotaNaoEncontrada);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`API MinhaData rodando em http://localhost:${PORT}`);
});
