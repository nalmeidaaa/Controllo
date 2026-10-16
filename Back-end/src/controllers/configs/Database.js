import mysql from 'mysql2/promise';
import 'dotenv/config';

//Classe = Um molde, uma forma para construir (precisa ser de letra maiúscula). Aqui é um modelo para construirmos uma conexão com o banco de dados 

//Design Pattern: Singleton -> permite a criação de apenas uma instância da classe

class Database {
    static #instance = null;
    #pool = null;

    //Funcão/Método privada
    #createPool(){
        this.#pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 100,
            queueLimit: 0
        });
    }

    static getInstance(){
        if(!Database.#instance){
            Database.#instance = new Database(); //Se não existir, criará um novo database
            Database.#instance.#createPool(); //Ter acesso aos métodos da classe
        }
        return Database.#instance;
    }

    //É público porque como trabalha com instâncias, precisa ser acessado por fora
    getPool(){
        return this.#pool;
    }
}

//exportar
export const connection = Database.getInstance().getPool();