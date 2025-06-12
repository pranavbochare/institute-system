const { runQuery } = require("./runQuery");
const { TABLE_NAMES, getConnection } = require("./database");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./jwt");

async function getInstitute(connection, admin_id) {
  const query = `
    SELECT * FROM ${TABLE_NAMES.INSTITUTE}
    WHERE admin_id = ${admin_id}
  `;
  const institutes = await runQuery(query, connection);
  console.log("get institute by admin id : ", institutes);
  return institutes;
}

async function createInstitute(connection, { name, address, mobile, admin_id }) {
  const existingInstitutes = await getInstitute(connection, admin_id);

  if (existingInstitutes.length > 0) {
    return { status: 409, error: "Institute is already created for this admin" };
  }

  const getByNameQuery = `
    SELECT * FROM ${TABLE_NAMES.INSTITUTE}
    WHERE name = '${name}'
  `;
  const institutes = await runQuery(getByNameQuery, connection);
  if (institutes.length > 0) {
    return { status: 409, error: "Institute with provided name already exists" };
  }

  const query = `
    INSERT INTO ${TABLE_NAMES.INSTITUTE} (name, address, mobile, admin_id)
    VALUES ('${name}', '${address}', '${mobile}', ${admin_id});
  `;
  const result = await runQuery(query, connection);
  console.log("Institute created: ", result);

  const getQuery = `
    SELECT * FROM ${TABLE_NAMES.INSTITUTE}
    WHERE id = ${result.insertId}
  `;
  const createdInstitutes = await runQuery(getQuery, connection);

  return { status: 201, data: createdInstitutes };
}

async function updateInstitute(connection, institute_id, name, address, mobile) {
  const query = `
    SELECT * FROM ${TABLE_NAMES.INSTITUTE}
    WHERE id = ${institute_id}
  `;
  const existingInstitutes = await runQuery(query, connection);

  if (existingInstitutes.length === 0) {
    return { status: 404, error: "Institute not found, please create first" };
  }

  const existing = existingInstitutes[0];

  if (existing.name === name && existing.address === address && existing.mobile === mobile) {
    return { status: 400, error: "Institute already has the same data." };
  }

  const queryUpdate = `
    UPDATE ${TABLE_NAMES.INSTITUTE}
    SET name = '${name}', address = '${address}', mobile = '${mobile}'
    WHERE id = ${institute_id}
  `;
  const result = await runQuery(queryUpdate, connection);
  console.log("Institute updated: ", result);

  return { status: 200, data: result };
}

async function uploadLogo(connection, institute_id, logoBuffer) {
  const query = `SELECT * FROM ${TABLE_NAMES.INSTITUTE} WHERE id = ${institute_id}`;
  const result = await runQuery(query, connection);
  console.log(result);
  if (result.length === 0) {
    return { status: 404, error: "Institute not found" };
  }

  const updateQuery = `UPDATE ${TABLE_NAMES.INSTITUTE} SET logo = ${connection.escape(
    logoBuffer
  )} WHERE id = ${institute_id}`;

  const updatedResult = await runQuery(updateQuery, connection);
  console.log("updated result : ", updatedResult);
  return { status: 200, data: updatedResult };
}

async function getInstituteLogo(connection, institute_id) {
  const query = `SELECT logo FROM ${TABLE_NAMES.INSTITUTE} WHERE id = ${institute_id}`;
  const result = await runQuery(query, connection);

  if (result.length === 0 || !result[0].logo) {
    return { status: 404, error: "Logo not found" };
  }

  const buffer = result[0].logo;
  return { status: 200, buffer };
}

async function instituteAuthorization(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET_KEY);

    console.log("Decoded token:", decoded);
    const adminId = decoded.id;

    const connection = getConnection();

    const query = `
      SELECT * FROM ${TABLE_NAMES.INSTITUTE}
      WHERE admin_id = '${adminId}'
    `;
    const institute = await runQuery(query, connection);

    if (!institute || institute.length === 0) {
      return res.status(403).json({ error: "No institute found for this admin" });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      institute_id: institute[0].id,
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  getInstitute,
  createInstitute,
  updateInstitute,
  uploadLogo,
  getInstituteLogo,
  instituteAuthorization,
};
