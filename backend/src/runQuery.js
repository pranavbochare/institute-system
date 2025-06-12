const { getConnection, connect } = require("./database");

function runQuery(query, connection) {
  const promise = new Promise((resolve, reject) => {
    connection.query(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  return promise;
}
module.exports = { runQuery };
