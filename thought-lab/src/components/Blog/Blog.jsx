import React, { useEffect, useState } from "react";
import styles from "./Blog.module.css";
import { useNavigate } from "react-router-dom";
import { getAllBlogs } from "../../http";
import SplashCursor from "../react-bits/SplashCursor";

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
    const [expandedSeries, setExpandedSeries] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "An error occurred while fetching blogs"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const extractText = (html) => {
        if (!html) return "";
        const div = document.createElement("div");
        div.innerHTML = html;
        div.querySelectorAll("img").forEach((img) => img.remove());
        return div.textContent || "";
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <SplashCursor />
                <div className={styles.heroHeader}>
                    <span className={styles.heroLabel}>Thought Lab</span>
                    <h1 className={styles.heroTitle}>Our <span>Blog</span></h1>
                    <div className={styles.heroDivider} />
                </div>
                <div className={styles.skeletonGrid}>
                    {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageWrapper}>
                <SplashCursor />
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>😕</div>
                    <p className={styles.errorMessage}>{error}</p>
                    <button className={styles.retryButton} onClick={() => window.location.reload()}>↺ Try Again</button>
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className={styles.pageWrapper}>
                <SplashCursor />
                <div className={styles.emptyContainer}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h2 className={styles.emptyTitle}>No posts yet</h2>
                    <p className={styles.emptySubtitle}>Check back soon — great content is on its way!</p>
                </div>
            </div>
        );
    }

    /* ── Group blogs by series ── */
    const seriesMap = {};
    const standaloneBlogs = [];

    blogs.forEach((blog) => {
        if (blog.series && blog.series._id) {
            const sid = blog.series._id;
            if (!seriesMap[sid]) {
                seriesMap[sid] = { series: blog.series, blogs: [] };
            }
            seriesMap[sid].blogs.push(blog);
        } else {
            standaloneBlogs.push(blog);
        }
    });

    Object.values(seriesMap).forEach((group) => {
        group.blogs.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    });

    const allItems = [...Object.values(seriesMap), ...standaloneBlogs];
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const currentItems = allItems.slice(start, start + itemsPerPage);
    const paginate = (p) => setCurrentPage(p);

    return (
        <div className={styles.pageWrapper}>
            <SplashCursor />
            <div className={styles.heroHeader}>
                <span className={styles.heroLabel}>Thought Lab</span>
                <h1 className={styles.heroTitle}>Our <span>Blog</span></h1>
                <div className={styles.heroDivider} />
            </div>

            <div className={styles.blogGrid}>
                {currentItems.map((item, index) => {

                    /* ── Series grouped card ── */
                    if (item.series) {
                        const firstBlog = item.blogs[0];
                        return (
                            <article
                                className={styles.blogCard}
                                key={`series-${item.series._id}`}
                                style={{ "--i": index, cursor: 'pointer' }}
                                onClick={() => navigate(`/blog/${firstBlog._id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === "Enter" && navigate(`/blog/${firstBlog._id}`)}
                                aria-label={`Read series: ${item.series.title}`}
                            >
                                <div className={styles.thumbnailWrapper}>
                                    <img
                                        src={firstBlog?.thumbnail}
                                        alt={item.series.title}
                                        className={styles.thumbnail}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.jpg"; }}
                                    />
                                    <div className={styles.thumbnailOverlay} />
                                    <span className={styles.cardBadge} style={{ background: '#2b6cb0' }}>
                                        📚 Series · {item.blogs.length} ch
                                    </span>
                                </div>

                                <div className={styles.cardBody}>
                                    <h2 className={styles.cardTitle}>{item.series.title}</h2>
                                    {item.series.description && (
                                        <p className={styles.cardExcerpt} style={{ marginBottom: '0.6rem' }}>
                                            {item.series.description}
                                        </p>
                                    )}

                                    {/* Chapter list */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedSeries(prev => ({ ...prev, [item.series._id]: !prev[item.series._id] }));
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.5rem', background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '6px', cursor: 'pointer',
                                                marginBottom: expandedSeries[item.series._id] ? '0.5rem' : '0',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                                                Contents &middot; {item.blogs.length} chapters
                                            </span>
                                            <svg
                                                style={{ transform: expandedSeries[item.series._id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateRows: expandedSeries[item.series._id] ? '1fr' : '0fr',
                                            transition: 'grid-template-rows 0.3s ease',
                                        }}>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.25rem' }}>
                                                    {item.blogs.map((b) => (
                                                        <div
                                                            key={b._id}
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/blog/${b._id}`); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                padding: '0.35rem 0.6rem',
                                                                background: 'rgba(255,255,255,0.07)',
                                                                borderRadius: '6px', cursor: 'pointer',
                                                                fontSize: '0.82rem', transition: 'background 0.2s',
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(49,130,206,0.3)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                                        >
                                                            <span style={{ color: '#90cdf4', fontWeight: 'bold', minWidth: '3.5rem' }}>
                                                                Part {b.chapterNumber ?? '?'}
                                                            </span>
                                                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {b.title}
                                                            </span>
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                                            </svg>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <span
                                        className={styles.readMore}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/blog/${firstBlog._id}`); }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Start Reading
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M13 6l6 6-6 6" />
                                        </svg>
                                    </span>
                                </div>
                            </article>
                        );
                    }

                    /* ── Standalone blog card ── */
                    const blog = item;
                    return (
                        <article
                            className={styles.blogCard}
                            key={blog._id}
                            style={{ "--i": index }}
                            onClick={() => navigate(`/blog/${blog._id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === "Enter" && navigate(`/blog/${blog._id}`)}
                            aria-label={`Read blog: ${blog.title}`}
                        >
                            <div className={styles.thumbnailWrapper}>
                                <img
                                    src={blog.thumbnail}
                                    alt={blog.title || "Blog thumbnail"}
                                    className={styles.thumbnail}
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.jpg"; }}
                                />
                                <div className={styles.thumbnailOverlay} />
                                {blog.tags && (
                                    <span className={styles.cardBadge}>{blog.tags.split(",")[0].trim()}</span>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{blog.title}</h2>
                                <p className={styles.cardExcerpt}>{extractText(blog.content).slice(0, 160)}…</p>

                                {blog.tags && (
                                    <div className={styles.tagRow}>
                                        {blog.tags.split(",").slice(0, 3).map((t, i) => (
                                            <span key={i} className={styles.tag}>#{t.trim()}</span>
                                        ))}
                                    </div>
                                )}

                                <span className={styles.readMore}>
                                    Read Article
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>Prev</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} onClick={() => paginate(i + 1)} className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ""}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={styles.pageButton}>Next</button>
                </div>
            )}
        </div>
    );
};

export default Blog;