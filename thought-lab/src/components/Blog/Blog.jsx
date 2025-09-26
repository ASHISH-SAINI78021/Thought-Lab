import React, { useEffect, useState } from "react";
import styles from "./Blog.module.css";
// import { url } from "../../url"; // Removed, Axios utility handles the URL
import { useNavigate } from "react-router-dom";
// Import the new Axios API function
import { getAllBlogs } from "../../http"; 

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      // console.log("Trying to fetch blogs from", `${url}/all-blogs`); // No longer needed
      try {
        setLoading(true);
        setError(null);
        
        // --- AXIOS INTEGRATION ---
        // Axios handles network error and non-2xx status codes by throwing an error
        let response = await getAllBlogs();
        const resData = response.data; // Axios wraps the response body in 'data'
        
        console.log("Parsed response:", resData);
        
        if (resData.success) {
          console.log(resData.blogs);
          setBlogs(resData.blogs);
        } else {
          // If response is 200 but the server returns success: false
          throw new Error(resData.message || "Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        
        // Use the server's error message if available, or a generic one
        const errorMessage = err.response?.data?.message || err.message || "An error occurred while fetching blogs";
        setError(errorMessage);
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
        {/* Added a visual spinner/animation in the actual CSS would be good */}
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
            src={`${blog.thumbnail}`}
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