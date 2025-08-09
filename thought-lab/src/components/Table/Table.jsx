import React, { useEffect, useState } from "react";
import { Pagination, Dropdown, Button, Space } from "antd";
import { url } from "../../url";
import styles from "./Table.module.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io(`${url}`);

const rowsOptions = [
  { label: "5", key: "5" },
  { label: "8", key: "8" },
  { label: "20", key: "20" },
];

const Table = ({ screen }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  // WebSocket initiation
  useEffect(() => {
    socket.emit("get-initial-leaderboard");

    // Initial load
    socket.on("leaderboard-data", (leaderboard) => {
      setData(leaderboard);
    });

    // Listen for leaderboard updates
    socket.on("leaderboard-update", (leaderboard) => {
      setData(leaderboard);
    });

    return () => {
      socket.off("leaderboard-data");
      socket.off("leaderboard-update");
    };
  }, []);

  // Filter based on user details
  const filteredData = data.filter((item) => {
    const name = item?.user?.name || "";
    const rollNumber = item?.user?.rollNumber || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  console.log(paginatedData);
  const handleMenuClick = (e) => {
    setRowsPerPage(parseInt(e.key));
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search"
          className={styles.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.head}>
            <th>ID</th>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <tr
                key={item._id}
                onClick={() => navigate(`/admin/${item.user?._id}`)}
              >
                <td>{index + 1}</td>
                <td>{item.user?.name || "-"}</td>
                <td>{item.user?.rollNumber || "-"}</td>
                <td>{item.user?.branch || "-"}</td>
                <td>{item.user?.year || "-"}</td>
                <td>{item.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.footer}>
        <div className={styles.rows}>
          <Dropdown menu={{ items: rowsOptions, onClick: handleMenuClick }}>
            <Button
              style={{
                color: "white",
                background: "transparent",
                border: "none",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Space style={{ color: "black" }}>
                Rows per page: {rowsPerPage}
              </Space>
            </Button>
          </Dropdown>
        </div>
        <div className={styles.pagination}>
          <Pagination
            current={currentPage}
            total={filteredData.length}
            pageSize={rowsPerPage}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Table;
