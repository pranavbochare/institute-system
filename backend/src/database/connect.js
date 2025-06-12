const mysql = require("mysql2");
const { DATABASE_CONFIG } = require("./dbConfig");

let connection = null;

function connect() {
  try {
    if (connection) {
      console.log("Connection already present");
    } else {
      console.log("Creating Connection");
      connection = mysql.createConnection({
        host: DATABASE_CONFIG.HOST,
        user: DATABASE_CONFIG.USER,
        database: DATABASE_CONFIG.NAME,
        password: DATABASE_CONFIG.PASSWORD,
      });
    }
  } catch (error) {
    console.error("Db connect error", error);
  }
}

function getConnection() {
  return connection;
}

module.exports = {
  connect,
  getConnection,
};
