import jwt from "jsonwebtoken";

export const isLogin = (req, res, next) => {
  try {
    // If token comes from cookies:
    const token = req.cookies?.token
      // Or if token is sent directly in the "authorization" header without Bearer
      || req.headers["authorization"]
      // Or from a custom header
      || req.headers["x-auth-token"];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to req
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};