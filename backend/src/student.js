const { runQuery } = require("./runQuery");
const { TABLE_NAMES, getConnection } = require("./database");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./jwt");
const xlsx = require("xlsx");
const fs = require("fs");

async function displayStudents(connection, institute_id) {
  const query = `SELECT * FROM ${TABLE_NAMES.STUDENT} WHERE institute_id = ${institute_id}`;
  const students = await runQuery(query, connection);
  if (students.length == 0) {
    return {
      status: 404,
      error: "students not added, please add students first",
    };
  } else {
    return { status: 200, data: students };
  }
}

async function updateStudent(connection, studentName, studentClass, studentMobile, id) {
  const query = `
    SELECT name, class, mobile FROM ${TABLE_NAMES.STUDENT}
    WHERE id = ${id}
  `;
  const existingStudent = await runQuery(query, connection);

  if (existingStudent.length === 0) {
    return {
      status: 404,
      error: "Student not found",
    };
  }

  const currentStudent = existingStudent[0];

  if (
    currentStudent.name === studentName &&
    currentStudent.class === studentClass &&
    currentStudent.mobile === studentMobile
  ) {
    return {
      status: 409,
      error: "Student already has the same data, No update needed",
    };
  }

  const updateQuery = `
    UPDATE ${TABLE_NAMES.STUDENT}
    SET name = '${studentName}', class = '${studentClass}', mobile = '${studentMobile}'
    WHERE id = ${id}
  `;
  const updateResult = await runQuery(updateQuery, connection);

  return {
    status: 200,
    data: "Student updated successfully",
  };
}

async function deleteStudent(connection, id) {
  const query = `DELETE FROM ${TABLE_NAMES.STUDENT} WHERE id = ${id}`;
  const result = await runQuery(query, connection);

  if (result.affectedRows === 0) {
    return {
      status: 404,
      error: "Student not found",
    };
  }

  return {
    status: 200,
    data: "Student deleted successfully",
  };
}

async function addStudent(connection, studentName, studentClass, studentMobile, institute_id) {
  let query = `
		select * from ${TABLE_NAMES.STUDENT}
		where mobile='${studentMobile}' AND '${studentName}'
	`;

  const students = await runQuery(query, connection);
  console.log("addStudent : ", students);

  if (students.length > 0) {
    return { status: 409, error: "This student already added , Add new one" };
  } else {
    let query = `
      insert into ${TABLE_NAMES.STUDENT}
      (name,class,mobile,institute_id)
      values ('${studentName}','${studentClass}','${studentMobile}',${institute_id})
    `;
    const student = await runQuery(query, connection);
    console.log("addStudent: ", student);
    return {
      status: 201,
      data: "student added successfully",
    };
  }
}

async function importStudents(filePath, instituteId, connection) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  for (const row of data) {
    const { name, stuClass, mobile } = row;
    if (!name || !stuClass || !mobile) continue;

    const query = `
      INSERT INTO ${TABLE_NAMES.STUDENT} (name, class, mobile, institute_id)
      VALUES ('${name}', '${stuClass}', '${mobile}', ${instituteId})
    `;

    await runQuery(query, connection);
  }

  fs.unlinkSync(filePath);

  return { status: 200, message: "Students imported successfully" };
}

async function studentsAuthorization(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Autho decoded token : ", decoded);
    console.log(decoded.id);
    const adminId = decoded.id;
    const query = `
      SELECT * FROM ${TABLE_NAMES.INSTITUTE}
      WHERE admin_id= '${adminId}'
    `;

    const connection = getConnection();
    const institute = await runQuery(query, connection);
    console.log("institute : ", institute);
    const instituteId = institute[0].id;
    console.log("institute id : ", institute[0].id);

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      institute_id: instituteId,
    };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  displayStudents,
  updateStudent,
  deleteStudent,
  addStudent,
  importStudents,
  studentsAuthorization,
};
