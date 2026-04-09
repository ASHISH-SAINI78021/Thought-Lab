import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/auth";
import MentorPicker from "../Student/MentorPicker/MentorPicker";

const StudentRoute = ({ children }) => {
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

    if (!auth?.user || (auth.user.role !== "student" && auth.user.role !== "user" && auth.user.role !== "admin" && auth.user.role !== "superAdmin" && auth.user.role !== "mentor")) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Force students/users/mentors to pick a mentor before accessing any protected portal routes
    if ((auth.user.role === "student" || auth.user.role === "user" || auth.user.role === "mentor") && !auth.user.mentorId) {
        return <MentorPicker />;
    }

    return children;
};

export default StudentRoute;
