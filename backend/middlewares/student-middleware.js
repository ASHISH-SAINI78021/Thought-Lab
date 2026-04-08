const isStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        if (req.user.role === 'student' || req.user.role === 'user' || req.user.role === 'admin' || req.user.role === 'superAdmin') {
            next();
        } else {
            return res.status(403).json({ success: false, message: "Access denied. Student module." });
        }
    } catch (error) {
        console.error("Error in isStudent middleware:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { isStudent };
