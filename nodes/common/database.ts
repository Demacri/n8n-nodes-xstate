const knex = require('knex');

class Database {
  private static instance: any;
  private connection: any;

  private constructor() {
    const dbType = process.env.DB_TYPE || 'sqlite';

    switch (dbType) {
      case 'postgresdb':
        this.connection = {
          host: process.env.DB_POSTGRESDB_HOST,
          port: process.env.DB_POSTGRESDB_PORT,
          user: process.env.DB_POSTGRESDB_USER,
          password: process.env.DB_POSTGRESDB_PASSWORD,
          database: process.env.DB_POSTGRESDB_DATABASE
        };
        break;
      case 'sqlite':
        const homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        this.connection = {
          filename: process.env.DB_SQLITE_FILENAME  || `${homeDir}/.n8n/database.sqlite`
        };
        break;
      // You can add more cases for other database types (e.g., mysql, etc.)
    }

    Database.instance = knex({
      client: dbType,
      connection: this.connection
    });
  }

  public static getInstance(): any {
    if (!Database.instance) {
      new Database();
    }
    return Database.instance;
  }
}

export const db = Database.getInstance();
