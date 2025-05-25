import React, { useEffect, useState } from "react";
import styles from "./Blog.module.css";
import { url } from "../../url";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      console.log("Trying to fetch blogs from", `${url}/all-blogs`);
      try {
        let response = await fetch(`${url}/all-blogs`);
        console.log("Raw response:", response);
        if (response.ok) {
          const resData = await response.json();
          console.log("Parsed response:", resData);
          if (resData.success) {
            setBlogs(resData.blogs);
          }
        } else {
          console.error("Response not OK");
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  // Utility to remove all <img> tags and extract text
  const extractTextContent = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;

    // Remove all <img> tags
    const images = div.querySelectorAll("img");
    images.forEach((img) => img.remove());

    // Get only the text content
    return div.textContent || "";
  };

  return (
    <div className={styles.blogList}>
      {blogs.map((blog) => (
        <div className={styles.blogCard} key={blog._id} onClick={()=> navigate(`/blog/${blog._id}`)}>
          <img
            src={`${url}${blog.thumbnail}`}
            alt="Thumbnail"
            className={styles.thumbnail}
          />
          <div className={styles.details}>
            <h1 className={styles.h1}>{blog.title}</h1>
            <p>{extractTextContent(blog.content).slice(0, 200)}...</p>
            <span className={styles.tags}>Tags: {blog.tags}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blog;
