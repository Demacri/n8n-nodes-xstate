const knex = require('knex');

class Database {
  private static instance: any;
  private connection: any;
	private readonly dbTypeMapN8NToKnex: Record<string,string> = {
		'mysqldb': 'mysql',
		'mariadb': 'mysql',
		'postgresdb': 'postgres',
		'sqlite': 'sqlite',
	};
  private constructor() {
    const dbType = this.dbTypeMapN8NToKnex[process.env.DB_TYPE || 'sqlite'];

    switch (dbType) {
      case 'postgres':
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
			case 'mysql':
				this.connection = {
					host: process.env.DB_MYSQLDB_HOST,
					port: process.env.DB_MYSQLDB_PORT,
					user: process.env.DB_MYSQLDB_USER,
					password: process.env.DB_MYSQLDB_PASSWORD,
					database: process.env.DB_MYSQLDB_DATABASE
				};
				break;
			default:
				throw new Error(`Unknown database type ${dbType}`);
    }

    Database.instance = knex({
      client: dbType,
      connection: this.connection,
			useNullAsDefault: true
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
