import React, { useEffect, useState } from "react";
import styles from "./Blog.module.css";
import { useNavigate } from "react-router-dom";
import { getAllBlogs } from "../../http";

/* Skeleton card placeholder */
const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
        </div>
    </div>
);

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAllBlogs();
                const resData = response.data;
                if (resData.success) {
                    setBlogs(resData.blogs);
                } else {
                    throw new Error(resData.message || "Failed to fetch blogs");
                }
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    err.message ||
                    "An error occurred while fetching blogs";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    /* Strip HTML, return plain text */
    const extractText = (html) => {
        if (!html) return "";
        const div = document.createElement("div");
        div.innerHTML = html;
        div.querySelectorAll("img").forEach((img) => img.remove());
        return div.textContent || "";
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.heroHeader}>
                    <span className={styles.heroLabel}>Thought Lab</span>
                    <h1 className={styles.heroTitle}>
                        Our <span>Blog</span>
                    </h1>
                    <div className={styles.heroDivider} />
                </div>
                <div className={styles.skeletonGrid}>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>😕</div>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={() => window.location.reload()}
                    >
                        ↺ Try Again
                    </button>
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (blogs.length === 0) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.emptyContainer}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h2 className={styles.emptyTitle}>No posts yet</h2>
                    <p className={styles.emptySubtitle}>
                        Check back soon — great content is on its way!
                    </p>
                </div>
            </div>
        );
    }

    /* ── Pagination Logic ── */
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    /* ── Blog Listing ── */
    return (
        <div className={styles.pageWrapper}>
            {/* Hero header */}
            <div className={styles.heroHeader}>
                <span className={styles.heroLabel}>Thought Lab</span>
                <h1 className={styles.heroTitle}>
                    Our <span>Blog</span>
                </h1>
                <div className={styles.heroDivider} />
            </div>

            {/* Cards grid */}
            <div className={styles.blogGrid}>
                {currentBlogs.map((blog, index) => (
                    <article
                        className={styles.blogCard}
                        key={blog._id}
                        style={{ "--i": index }}
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) =>
                            e.key === "Enter" && navigate(`/blog/${blog._id}`)
                        }
                        aria-label={`Read blog: ${blog.title}`}
                    >
                        {/* Thumbnail */}
                        <div className={styles.thumbnailWrapper}>
                            <img
                                src={blog.thumbnail}
                                alt={blog.title || "Blog thumbnail"}
                                className={styles.thumbnail}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-image.jpg";
                                }}
                            />
                            <div className={styles.thumbnailOverlay} />
                            {blog.tags && (
                                <span className={styles.cardBadge}>
                                    {blog.tags.split(",")[0].trim()}
                                </span>
                            )}
                        </div>

                        {/* Body */}
                        <div className={styles.cardBody}>
                            <h2 className={styles.cardTitle}>{blog.title}</h2>
                            <p className={styles.cardExcerpt}>
                                {extractText(blog.content).slice(0, 160)}…
                            </p>

                            {/* Tags row */}
                            {blog.tags && (
                                <div className={styles.tagRow}>
                                    {blog.tags
                                        .split(",")
                                        .slice(0, 3)
                                        .map((t, i) => (
                                            <span key={i} className={styles.tag}>
                                                #{t.trim()}
                                            </span>
                                        ))}
                                </div>
                            )}

                            <span className={styles.readMore}>
                                Read Article
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ""}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.pageButton}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Blog;