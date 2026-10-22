import express from "express";
import cors from "cors";
import dotenvSafe from "dotenv-safe";
import testConnect from "./db/testConnect.js";
import apiRoutes from "./routes/apiRoutes.js";

dotenvSafe.config({
  path: "./.env",
  example: "./.env.example",
  allowEmptyValues: true,
});

class AppController {
  //Define uma classe para organizar a lógica da aplicação
  constructor() {
    this.express = express(); //Cria uma nova instância do Express dentro da classe
    this.middlewares(); //Chama o método middlewares para configurar os middlewares
    this.routes(); //Chama o método routes para definir as rotas da API
    testConnect();
  }

  middlewares() {
    //Permite que a aplicação receba dados no formato JSON nas requisições
    this.express.use(express.json());
    this.express.use(cors());
  }

  routes() {
    this.express.use('/api/v1/',apiRoutes);// Definição da URL Base
    this.express.get('/', (_,res)=> {
      res.send({status:'OK'})
    });
  }
}

export default new AppController().express;
