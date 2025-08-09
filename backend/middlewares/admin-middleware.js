export const isAdmin = (req, res, next) => {
    try {
      // The authentication middleware should have already set req.user
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
      }

      if (req.user.role === "superAdmin"){
        return next();
      }
  
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
      }
  
      next(); // User is admin, proceed to the next handler
    } catch (err) {
      res.status(500).json({ message: "Server error in admin middleware" });
    }
};  