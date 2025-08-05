import React, { useEffect, useState } from "react";
import styles from "./Blog.module.css";
import { url } from "../../url";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      console.log("Trying to fetch blogs from", `${url}/all-blogs`);
      try {
        setLoading(true);
        setError(null);
        
        let response = await fetch(`${url}/all-blogs`);
        console.log("Raw response:", response);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const resData = await response.json();
        console.log("Parsed response:", resData);
        
        if (resData.success) {
          setBlogs(resData.blogs);
        } else {
          throw new Error(resData.message || "Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError(err.message || "An error occurred while fetching blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Utility to remove all <img> tags and extract text
  const extractTextContent = (html) => {
    if (!html) return "";
    
    const div = document.createElement("div");
    div.innerHTML = html;

    // Remove all <img> tags
    const images = div.querySelectorAll("img");
    images.forEach((img) => img.remove());

    // Get only the text content
    return div.textContent || "";
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Error: {error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No blogs found.</p>
      </div>
    );
  }

  return (
    <div className={styles.blogList}>
      {blogs.map((blog) => (
        <div 
          className={styles.blogCard} 
          key={blog._id} 
          onClick={() => navigate(`/blog/${blog._id}`)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && navigate(`/blog/${blog._id}`)}
        >
          <img
            src={`${url}${blog.thumbnail}`}
            alt={blog.title || "Blog thumbnail"}
            className={styles.thumbnail}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          <div className={styles.details}>
            <h1 className={styles.h1}>{blog.title}</h1>
            <p>{extractTextContent(blog.content).slice(0, 200)}...</p>
            {blog.tags && (
              <span className={styles.tags}>Tags: {blog.tags}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blog;