const { runQuery } = require("./runQuery");
const { TABLE_NAMES, getConnection } = require("./database");
const { createToken } = require("./jwt");

async function createAdmin(connection, email, password) {
  let query = `insert into ${TABLE_NAMES.ADMIN} (email, password) values ('${email}','${password}')`;
  const admin = await runQuery(query, connection);
  console.log("createAdmin: ", admin);
  return admin;
}

async function getAdmin(connection, email, password) {
  let query = `
		select * from ${TABLE_NAMES.ADMIN}
		where email='${email}'
	`;

  if (password) {
    query = `
			select * from ${TABLE_NAMES.ADMIN}
			where email='${email}' and password='${password}'
		`;
  }

  const admins = await runQuery(query, connection);
  console.log("getAdmin: ", admins);
  return admins;
}

async function registerAdmin(connection, email, password) {
  const existingAdmins = await getAdmin(connection, email);
  if (existingAdmins.length > 0) {
    return { status: 409, error: "Admin with provided email already present, please login" };
  } else {
    const admin = await createAdmin(connection, email, password);
    return {
      status: 201,
      data: "Admin created successfully. Please login.",
    };
  }
}

async function loginAdmin(connection, email, password) {
  const admins = await getAdmin(connection, email, password);
  if (admins.length == 0) {
    return {
      status: 401,
      error: "Email/password does not exist.",
    };
  } else {
    const admin = admins[0];
    const token = createToken({ id: admin.id, email: admin.email });
    return {
      status: 200,
      data: { id: admin.id, email: admin.email, token },
    };
  }
}

async function verifyAdmin(req, res, next) {
  const connection = getConnection();
  const decoded = req.admin;
  const admins = await getAdmin(connection, decoded.email);
  if (admins.length == 0) {
    return res.status(403).json({ error: "Admin not present for provided token" });
  }
  next();
}

module.exports = {
  verifyAdmin,
  getAdmin,
  loginAdmin,
  registerAdmin,
};
