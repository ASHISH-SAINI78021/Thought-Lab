import React from "react";
import { url } from "../../../url";

const DownloadAttendance = () => {
  const handleDownload = () => {
    // Directly open the URL in a new tab or trigger download
    window.open(`${url}/download-attendance`, "_blank");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <button
        onClick={handleDownload}
        style={{
          padding: "12px 24px",
          backgroundColor: "var(--primary)",
          color: "black",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Download Attendance Sheet
      </button>
    </div>
  );
};

export default DownloadAttendance;
