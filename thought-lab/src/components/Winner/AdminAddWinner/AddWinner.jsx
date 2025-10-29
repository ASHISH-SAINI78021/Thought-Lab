import React, { useState } from "react";

const UploadWinner = () => {
  const [winner, setWinner] = useState({
    name: "",
    rollNo: "",
    branch: "",
    event: "",
    position: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setWinner({ ...winner, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reader = new FileReader();
    reader.onloadend = () => {
      const savedWinners = JSON.parse(localStorage.getItem("winners")) || [];
      const newWinner = { ...winner, photo: reader.result };
      localStorage.setItem("winners", JSON.stringify([...savedWinners, newWinner]));
      alert("✅ Winner added successfully!");
      setWinner({
        name: "",
        rollNo: "",
        branch: "",
        event: "",
        position: "",
        photo: null,
      });
    };

    if (winner.photo) reader.readAsDataURL(winner.photo);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-center">Upload Winner</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={winner.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="rollNo"
          placeholder="Roll No."
          value={winner.rollNo}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={winner.branch}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="event"
          placeholder="Event Name"
          value={winner.event}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* 🥇 Position input */}
        <input
          type="text"
          name="position"
          placeholder="Position (e.g. 1st Place, 2nd Place)"
          value={winner.position}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Winner
        </button>
      </form>
    </div>
  );
};

export default UploadWinner;
