import React, { useState, useEffect, useRef } from 'react';
import './TaskAssigner.css'; // Reuse styles or add specific ones

const UserSearch = ({ users, onSelect }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (query.trim() === '') {
            setFilteredUsers([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
            (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
            (user.rollNumber && String(user.rollNumber).includes(lowerQuery))
        ).slice(0, 10); // Limit to 10 results

        setFilteredUsers(matches);
    }, [query, users]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (user) => {
        console.log("UserSearch selected:", user);
        onSelect(user);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="user-search-container" ref={wrapperRef}>
            <input
                type="text"
                placeholder="Search by Name, Email or ID..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="user-search-input"
            />
            {isOpen && filteredUsers.length > 0 && (
                <ul className="user-search-results">
                    {filteredUsers.map(user => (
                        <li key={user._id} onClick={() => handleSelect(user)}>
                            <div className="user-search-item">
                                <span className="user-name">{user.name}</span>
                                <span className="user-meta">{user.rollNumber} | {user.email}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserSearch;
