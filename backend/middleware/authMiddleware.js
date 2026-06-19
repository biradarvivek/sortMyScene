const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protectRoute = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or has expired.",
    });
  }
};

module.exports = { protectRoute };
