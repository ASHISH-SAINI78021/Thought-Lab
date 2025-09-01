import React from "react";
import alumniData from "./alumniData";
import AlumniCard from "./AlumniCard";

export default function Alumni() {
  // Extract latest year number (handles "2023-2025" or "2015")
  const getLatestYear = (yearStr) => {
    if (!yearStr) return 0;
    const matches = yearStr.match(/\d{4}/g);
    if (!matches) return 0;
    return Math.max(...matches.map(Number));
  };

  // Sort in ASC order (oldest first)
  const sortedData = [...alumniData].sort(
    (a, b) => getLatestYear(a.year) - getLatestYear(b.year)
  );

  return (
    <div className="alumni-container">
      {sortedData.map((alumni, index) => (
        <AlumniCard
          key={index}
          alumni={alumni}
          reverse={index % 2 !== 0} // alternate layout
        />
      ))}
    </div>
  );
}
