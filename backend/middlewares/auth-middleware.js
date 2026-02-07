const jwt = require("jsonwebtoken");

const isLogin = (req, res, next) => {
  try {
    // In Express, header keys are automatically converted to lowercase.
    // So 'Authorization' from the frontend becomes 'authorization' on the backend.
    const token = req.cookies?.token
      || req.headers["authorization"] // Use lowercase 'a'
      || req.headers["x-auth-token"];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload (which should contain user id, role, etc.) to the request object
    req.user = decoded; 
    
    // Compatibility: Alias id to _id if needed
    if (req.user.id && !req.user._id) {
        req.user._id = req.user.id;
    }
    
    next(); // Token is valid, proceed to the next middleware or route handler

  } catch (err) {
    // Provide a more specific error message for different token failures
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Unauthorized: The token is invalid." });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Unauthorized: The token has expired." });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};

module.exports = { isLogin };