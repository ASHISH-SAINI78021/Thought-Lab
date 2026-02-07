const isSuperAdmin = (req, res, next) => {
    try {
      // 1. Check if an authenticated user exists on the request object.
      // This relies on a preceding authentication middleware (e.g., JWT verification)
      // to have populated `req.user`.
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized: No user credentials found. Please log in." 
        });
      }
  
      // 2. Check if the user's role is specifically "superAdmin".
      if (req.user.role !== "superAdmin") {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: Access restricted to super admins only." 
        });
      }
  
      // 3. If the user is a superAdmin, pass control to the next middleware or route handler.
      next();
      
    } catch (err) {
      // 4. Catch any unexpected server errors.
      console.error("Error in isSuperAdmin middleware:", err);
      res.status(500).json({ 
        success: false, 
        message: "Server error during super admin authorization." 
      });
    }
  };

module.exports = { isSuperAdmin };