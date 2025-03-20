const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la conexión a la base de datos PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'padel_app',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Configuración del esquema según el entorno
    schema: process.env.DB_SCHEMA || 'dev'
  }
);

// Función para probar la conexión a la base de datos
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a la base de datos establecida correctamente en el esquema ${process.env.DB_SCHEMA || 'dev'}.`);
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
