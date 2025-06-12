const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(403).json({ error: "Token not provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ error: "Token format invalid" });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded token:", decoded);

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function createToken({ id, email }) {
  const token = jwt.sign({ id, email }, SECRET_KEY, { expiresIn: "12h" });
  return token;
}

module.exports = {
  verifyToken,
  createToken,
  SECRET_KEY,
};
