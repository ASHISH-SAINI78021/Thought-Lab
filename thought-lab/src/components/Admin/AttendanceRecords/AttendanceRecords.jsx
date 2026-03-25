import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import styles from './AttendanceRecords.module.css';
import { toast } from 'react-hot-toast';
import { Table, Tag, Input, Space, Button, DatePicker, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const AttendanceRecords = () => {
    const [auth] = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [studentQuery, setStudentQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${url}/api/all-attendance`, {
                headers: {
                    'Authorization': auth?.token
                }
            });
            const result = await response.json();
            if (result.success) {
                // Add unique index to each record for reliable rowKey
                const dataWithKeys = result.data.map((item, index) => ({
                    ...item,
                    key: `${item.rollNumber}-${item.date}-${item.time}-${index}`
                }));
                setAttendance(dataWithKeys);
                setFilteredAttendance(dataWithKeys);
            } else {
                toast.error(result.message || "Failed to fetch attendance");
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
            toast.error("An error occurred while fetching attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchAttendance();
        }
    }, [auth?.token]);

    useEffect(() => {
        let filtered = [...attendance];

        // Exact Date Filter
        if (selectedDate) {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            console.log('Filtering by date:', dateStr);
            filtered = filtered.filter(record => {
                const match = String(record.date || "").trim() === dateStr;
                return match;
            });
        }

        // Student Filter (Name or Roll Number)
        if (studentQuery) {
            const query = studentQuery.toLowerCase().trim();
            console.log('Filtering by student:', query);
            filtered = filtered.filter(record => {
                const nameMatch = (record.name || "").toLowerCase().includes(query);
                const rollMatch = (record.rollNumber || "").toLowerCase().includes(query);
                return nameMatch || rollMatch;
            });
        }

        // Branch Filter
        if (selectedBranch !== 'All') {
            console.log('Filtering by branch:', selectedBranch);
            filtered = filtered.filter(record => record.branch === selectedBranch);
        }

        console.log('Final filtered count:', filtered.length);
        setFilteredAttendance(filtered);
    }, [selectedDate, studentQuery, selectedBranch, attendance]);

    const resetFilters = () => {
        console.log('Resetting all filters');
        setSelectedDate(null);
        setStudentQuery('');
        setSelectedBranch('All');
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (text) => (
                <div className={styles.imageContainer}>
                    {text ? (
                        <img src={text} alt="Attendance" className={styles.attendanceImg} />
                    ) : (
                        <div className={styles.noImage}>No Image</div>
                    )}
                </div>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Roll Number',
            dataIndex: 'rollNumber',
            key: 'rollNumber',
            sorter: (a, b) => a.rollNumber.localeCompare(b.rollNumber),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            sorter: (a, b) => (a.branch || '').localeCompare(b.branch || ''),
        },
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year',
            sorter: (a, b) => (a.year || '').localeCompare(b.year || ''),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Present' ? 'green' : 'volcano'}>
                    {(status || 'UNKNOWN').toUpperCase()}
                </Tag>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Student Attendance Records</h1>
                <Space wrap>
                    <Input
                        placeholder="Search Student (Name or Roll)"
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                        style={{ width: 230 }}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    <Select
                        value={selectedBranch}
                        onChange={setSelectedBranch}
                        style={{ width: 120 }}
                        placeholder="Branch"
                    >
                        <Option value="All">All Branches</Option>
                        <Option value="CS">CS</Option>
                        <Option value="IT">IT</Option>
                        <Option value="ECE">ECE</Option>
                        <Option value="EE">EE</Option>
                        <Option value="ME">ME</Option>
                        <Option value="CE">CE</Option>
                    </Select>
                    <DatePicker
                        onChange={(date) => setSelectedDate(date)}
                        value={selectedDate}
                        placeholder="Select Date"
                        style={{ width: 150 }}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchAttendance}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        icon={<FilterOutlined />}
                        onClick={resetFilters}
                        danger={!!(selectedDate || studentQuery || selectedBranch !== 'All')}
                    >
                        Reset
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredAttendance}
                    loading={loading}
                    rowKey="key"
                    pagination={{ pageSize: 10 }}
                    bordered
                    className={styles.customTable}
                />
            </div>
        </div>
    );
};

export default AttendanceRecords;
