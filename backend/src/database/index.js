const { DATABASE_CONFIG, tableName } = require("./dbConfig");
const { connect, getConnection } = require("./connect");

module.exports = {
  TABLE_NAMES: tableName,
  connect,
  getConnection,
};
