const isMentor = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        if (req.user.role === 'mentor' || req.user.role === 'admin' || req.user.role === 'superAdmin') {
            next();
        } else {
            return res.status(403).json({ success: false, message: "Access denied. Mentor role required." });
        }
    } catch (error) {
        console.error("Error in isMentor middleware:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { isMentor };
