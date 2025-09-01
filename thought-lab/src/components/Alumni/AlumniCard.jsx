import React from "react";
import "./Alumni.css";

export default function AlumniCard({ alumni, reverse }) {
  return (
    <section className={`alumni-card ${reverse ? "reverse" : ""}`}>
      <div className="alumni-info">
        <h2>{alumni.name}</h2>
        <p><strong>🎓 Year of Graduation:</strong> {alumni.year}</p>
        <p>
          <strong>📧 Email:</strong>{" "}
          <a href={`mailto:${alumni.email}`}>{alumni.email}</a>
        </p>
        <p>
          <strong>🔗 LinkedIn:</strong>{" "}
          <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer">
            Profile
          </a>
        </p>
        <p><strong>📖 Journey:</strong> {alumni.journey}</p>
        <p><strong>💼 Company:</strong> {alumni.company}</p>
      </div>

      <div className="alumni-photo">
        <img src={alumni.photo} alt={`${alumni.name}`} />
      </div>
    </section>
  );
}
