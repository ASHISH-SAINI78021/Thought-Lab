import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/auth";

const MentorRoute = ({ children }) => {
    const [auth] = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!auth?.user || (auth.user.role !== "mentor" && auth.user.role !== "admin" && auth.user.role !== "superAdmin")) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default MentorRoute;
