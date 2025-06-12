const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const { connect, getConnection, TABLE_NAMES } = require("./database");
const { registerAdmin, loginAdmin, verifyAdmin } = require("./admin");
const { runQuery } = require("./runQuery");
const {
  getInstitute,
  createInstitute,
  updateInstitute,
  uploadLogo,
  getInstituteLogo,
  instituteAuthorization,
} = require("./institute");
const { verifyToken } = require("./jwt");
const {
  displayStudents,
  deleteStudent,
  updateStudent,
  addStudent,
  importStudents,
  studentsAuthorization,
} = require("./student");
const app = express();
const port = 8080;
const storage = multer.memoryStorage();
const upload = multer({ storage });

const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

const diskStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadDisk = multer({ storage: diskStorage });

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

connect();
const connection = getConnection();

app.get("/", (req, res) => {
  res.status(200).json({ status: "running" });
});

app.post("/admin/login", async (req, res) => {
  try {
    console.log("POST admin/login: started");
    const { email, password } = req.body;
    const { data, status, error } = await loginAdmin(connection, email, password);
    console.log("POST admin/login: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("POST admin/login: error --- ", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/register", async (req, res) => {
  try {
    console.log("POST admin/register: started");
    const { email, password } = req.body;
    const { data, status, error } = await registerAdmin(connection, email, password);
    console.log("POST admin/register: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("POST admin/register: error --- ", err);
    res.status(500).json({ error: err.message });
  }
});

app.get(
  "/institute/:admin_id",
  verifyToken,
  verifyAdmin,
  instituteAuthorization,
  async (req, res) => {
    try {
      console.log("GET /institute/:admin_id: started");
      const adminId = req.params.admin_id;
      console.log("admin id institute : ", adminId);
      console.log("admin id token : ", req.admin.id);

      if (Number(adminId) !== req.admin.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const institutes = await getInstitute(connection, adminId);
      console.log("GET /institute/:admin_id: completed");
      res.status(200).json({ data: institutes });
    } catch (err) {
      console.error("GET /institute/:admin_id: error ", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.put("/institute/:id", verifyToken, verifyAdmin, instituteAuthorization, async (req, res) => {
  try {
    console.log("PUT /institute/:id: started");
    const id = req.params.id;
    console.log("institute id put : ", id);
    console.log("institute id token : ", req.admin.institute_id);
    if (Number(id) !== req.admin.institute_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const { name, address, mobile } = req.body;

    const { data, status, error } = await updateInstitute(connection, id, name, address, mobile);
    console.log("PUT /institute/:id: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("PUT /institute/:id: error  ", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/institute", verifyToken, verifyAdmin, instituteAuthorization, async (req, res) => {
  try {
    console.log("POST /institute: started");
    const { name, address, mobile, admin_id } = req.body;

    if (Number(admin_id) !== req.admin.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, status, error } = await createInstitute(connection, req.body);
    console.log("POST /institute: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("POST /institute: error  ", err);
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/institute/uploadLogo",
  upload.single("logo"),
  verifyToken,
  verifyAdmin,
  instituteAuthorization,
  async (req, res) => {
    try {
      const { institute_id } = req.body;
      if (Number(institute_id) !== req.admin.institute_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const logoBuffer = req.file.buffer;
      const { data, status, error } = await uploadLogo(connection, institute_id, logoBuffer);
      res.status(status).json({ data, error });
      console.log("logo uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/institute/logo/:id",
  verifyToken,
  verifyAdmin,
  instituteAuthorization,
  async (req, res) => {
    try {
      const institute_id = req.params.id;
      if (Number(institute_id) !== req.admin.institute_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const { status, buffer, error } = await getInstituteLogo(connection, institute_id);

      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": buffer.length,
      });
      res.end(buffer);
    } catch (err) {
      console.error("GET /institute/logo/:id - Error:", err);
      res.status(500).send({ error: err.message });
    }
  }
);

app.post("/student", verifyToken, verifyAdmin, studentsAuthorization, async (req, res) => {
  try {
    console.log("POST /student: started");
    console.log("students : ", req.body);
    const { studentName, studentClass, studentMobile, institute_id } = req.body;

    if (Number(institute_id) !== req.admin.institute_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: cannot access student of another institute" });
    }

    const { data, status, error } = await addStudent(
      connection,
      studentName,
      studentClass,
      studentMobile,
      institute_id
    );
    console.log("POST /student: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("POST /student: error  ", err);
    res.status(500).json({ error: err });
  }
});

app.get(
  "/students/:institute_id",
  verifyToken,
  verifyAdmin,
  studentsAuthorization,
  async (req, res) => {
    try {
      const { institute_id } = req.params;
      console.log("req admin institute id : ", req.admin.institute_id);
      if (Number(institute_id) !== req.admin.institute_id) {
        return res
          .status(403)
          .json({ error: "Unauthorized: cannot access student of another institute" });
      }
      const students = await displayStudents(connection, institute_id);
      res.status(200).json({ data: students, error: null });
    } catch (err) {
      console.error("GET /students/:institute_id error", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete("/student/:id", verifyToken, verifyAdmin, studentsAuthorization, async (req, res) => {
  try {
    console.log("DELETE /student/:id: started");

    const { id } = req.params;

    let query = `SELECT *FROM ${TABLE_NAMES.STUDENT}  WHERE id=${id}`;
    const student = await runQuery(query, connection);

    const instituteId = student[0].institute_id;
    console.log("institute id : ", instituteId);

    if (Number(instituteId) !== req.admin.institute_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: cannot access student of another institute" });
    }

    const { data, status, error } = await deleteStudent(connection, id);

    console.log("DELETE /student/:id: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("DELETE /student/:id: error", err);
    res.status(404).json({ error: err.message });
  }
});

app.put("/student/:id", verifyToken, verifyAdmin, studentsAuthorization, async (req, res) => {
  try {
    console.log("PUT /student/:id: started");
    const id = req.params.id;

    let query = `SELECT *FROM ${TABLE_NAMES.STUDENT}  WHERE id=${id}`;
    const student = await runQuery(query, connection);

    const instituteId = student[0].institute_id;
    console.log("institute id put : ", instituteId);

    if (Number(instituteId) !== req.admin.institute_id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: cannot access student of another institute" });
    }

    const { studentName, studentClass, studentMobile } = req.body;

    const { data, status, error } = await updateStudent(
      connection,
      studentName,
      studentClass,
      studentMobile,
      id
    );
    console.log("PUT /student/:id: completed");
    res.status(status).json({ data, error });
  } catch (err) {
    console.error("PUT /student/:id: error  ", err);
    res.status(400).json({ error: err.message });
  }
});

app.post(
  "/student/import",
  uploadDisk.single("file"),
  verifyToken,
  verifyAdmin,
  studentsAuthorization,
  async (req, res) => {
    try {
      const filePath = req.file.path;
      const { instituteId } = req.body;
      if (Number(instituteId) !== req.admin.institute_id) {
        return res
          .status(403)
          .json({ error: "Unauthorized: cannot access student of another institute" });
      }
      const result = await importStudents(filePath, instituteId, connection);
      res.status(result.status).json(result);
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(port, () => {
  console.log(`app listening to the port ${port}`);
});
