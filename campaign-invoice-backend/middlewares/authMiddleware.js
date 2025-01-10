const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  
  const token1 = req.header("Authorization");                //personal changes @@
  if (!token1) {
    return res.status(401).json({ message: "Access denied" });
  }
  const token = token1.split(" ")[1];
  const status=true;
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);           //verified is nothing but the payload which is send
    console.log(verified);
    req.user=verified;
    console.log("me hu");
    next();
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    res.status(400).json({ message: "Invalid token",
      status:status,
    check: token });
  }
};

module.exports = authenticateToken;
