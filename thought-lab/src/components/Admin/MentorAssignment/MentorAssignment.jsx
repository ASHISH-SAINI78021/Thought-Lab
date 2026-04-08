import React, { useState, useEffect } from 'react';
import styles from './MentorAssignment.module.css';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import { toast } from 'react-hot-toast';

const MentorAssignment = () => {
    const [auth] = useAuth();
    const [mentors, setMentors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${url}/users`, {
                    headers: { 'Authorization': auth?.token }
                });
                const data = await res.json();
                if (data.success && data.users) {
                    setMentors(data.users.filter(u => u.role === 'mentor'));
                    // Admins can assign user or student role users
                    setStudents(data.users.filter(u => u.role === 'student' || u.role === 'user'));
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load users");
            }
        };

        if (auth?.token) {
            fetchUsers();
        }
    }, [auth?.token]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedMentor || !selectedStudent) {
            return toast.error("Please select both a mentor and a student.");
        }

        setLoading(true);
        try {
            const res = await fetch(`${url}/admin/assign-mentor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth?.token
                },
                body: JSON.stringify({ studentId: selectedStudent, mentorId: selectedMentor })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                // Update local state to reflect assignment
                setStudents(students.map(s => s._id === selectedStudent ? { ...s, mentorId: selectedMentor } : s));
            } else {
                toast.error(data.message || "Failed to assign mentor.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during assignment.");
        } finally {
            setLoading(false);
        }
    };

    const getMentorName = (mentorId) => {
        if (!mentorId) return "Unassigned";
        const m = mentors.find(m => m._id === mentorId);
        return m ? m.name : "Unknown Mentor";
    };

    // Calculate pagination slices
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(students.length / studentsPerPage);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Mentor Assignment</h2>

            <form onSubmit={handleAssign} className={styles.formCard}>
                <div className={styles.formGroup}>
                    <label>Select Mentor</label>
                    <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} required>
                        <option value="">-- Choose Mentor --</option>
                        {mentors.map(m => (
                            <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Select Student</label>
                    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
                        <option value="">-- Choose Student --</option>
                        {students.map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s.rollNumber}) - Current: {getMentorName(s.mentorId)}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? "Assigning..." : "Assign Mentor"}
                </button>
            </form>

            <div className={styles.listSection}>
                <h3 className={styles.subtitle}>Current Students</h3>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Roll Number</th>
                                <th>Role</th>
                                <th>Assigned Mentor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStudents.map(student => (
                                <tr key={student._id}>
                                    <td>{student.name}</td>
                                    <td>{student.rollNumber}</td>
                                    <td>{student.role}</td>
                                    <td>
                                        <span className={student.mentorId ? styles.assigned : styles.unassigned}>
                                            {getMentorName(student.mentorId)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className={styles.pageBtn}
                        >
                            Previous
                        </button>
                        <span className={styles.pageInfo}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className={styles.pageBtn}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorAssignment;
