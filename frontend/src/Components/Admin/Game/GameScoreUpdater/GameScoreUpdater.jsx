import React, { useEffect, useState } from "react";
import { Pagination, Dropdown, Button, Space } from "antd";
import { url } from "../../../../url";
import styles from "./GameScoreUpdater.module.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io(`${url}`);

const rowsOptions = [
  { label: "5", key: "5" },
  { label: "8", key: "8" },
  { label: "20", key: "20" },
];

const GameScoreUpdater = ({ screen }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get-initial-leaderboard");

    socket.on("leaderboard-data", (leaderboard) => {
      console.log(leaderboard);
      setData(leaderboard);
    });

    return () => {
      socket.off("leaderboard-data");
    };
  }, []);

  useEffect(() => {
    socket.on("leaderboard-update", (leaderboard) => {
      setData(leaderboard);
    });

    return () => {
      socket.off("leaderboard-update");
    };
  }, []);

  const filteredData = data.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleMenuClick = (e) => {
    setRowsPerPage(parseInt(e.key));
    setCurrentPage(1);
  };

  const handleScoreUpdate = (id, currentScore, type) => {
    const newScore = type === "increase" ? currentScore + 10 : Math.max(0, currentScore - 10);
    socket.emit("update-score", {
      id,
      score: newScore,
    });
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {paginatedData.length > 0 ? (
            paginatedData.map((item , index) => (
              <tr key={item._id}>
                  <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.rollNumber}</td>
                <td>{item.branch}</td>
                <td>{item.year}</td>
                <td>{item.score}</td>
                <td>
                  <button
                    className={styles.updateButton}
                    onClick={() => handleScoreUpdate(item._id, item.score, "increase")}
                  >
                    +10
                  </button>
                  <button
                    className={styles.decreaseButton}
                    onClick={() => handleScoreUpdate(item._id, item.score, "decrease")}
                  >
                    -10
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
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

export default GameScoreUpdater;
