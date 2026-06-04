import React, { useEffect, useState } from 'react';
import styles from './BlogItem.module.css';
import { url } from '../../../url';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import SplashCursor from '../../react-bits/SplashCursor';
import FocusPet from '../../FocusPet/FocusPet';
import LevelUpCard from '../../FocusPet/LevelUpCard';
import BadgeUnlockCard from '../../FocusPet/BadgeUnlockCard';
import toast from 'react-hot-toast';
import { getBlogSeriesById, deleteBlog } from '../../../http';

/* Helper: first letter of a name as avatar */
const Avatar = ({ name, className }) => {
  const initial = (name || 'A').charAt(0).toUpperCase();
  return <div className={className}>{initial}</div>;
};

const BlogItem = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [reactionDetails, setReactionDetails] = useState({ likes: [], dislikes: [] });
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [petData, setPetData] = useState(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [auth] = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── Fetch blog ── */
  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = auth?.token
        ? { Authorization: auth.token, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const res = await fetch(`${url}/all-blogs/${id}`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data?.blog) {
        setBlog(data.blog);
        setLikes(data.blog.likes || 0);
        setDislikes(data.blog.dislikes || 0);
        setUserReaction(data.userReaction || null);

        if (data.blog.series) {
          // series can be a populated object OR a raw ObjectId string
          const seriesId = data.blog.series._id || data.blog.series;
          fetchSeriesData(seriesId);
        }
      } else {
        throw new Error('Blog not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeriesData = async (seriesId) => {
    try {
      const response = await getBlogSeriesById(seriesId);
      if (response.data && response.data.success) {
        // Store the inner payload: { series, blogs }
        setSeriesData({ series: response.data.series, blogs: response.data.blogs });
      }
    } catch (e) {
      console.error("Failed to fetch series data", e);
    }
  };

  useEffect(() => { fetchBlog(); }, [id]);

  /* ── Reaction ── */
  const handleReaction = async (type) => {
    if (!auth?.token) { navigate('/login'); return; }
    try {
      const res = await fetch(`${url}/blog/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        if (res.status === 401) { alert('Please log in to react'); return; }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserReaction(data.userReaction);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Reaction details ── */
  const fetchReactionDetails = async () => {
    if (!auth?.token) { navigate('/login'); return; }
    try {
      const res = await fetch(`${url}/blog/${id}/reactions`, {
        headers: { Authorization: auth?.token, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 401) { alert('Please log in to view reactions'); return; }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setReactionDetails(data);
      setShowReactionDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Submit comment ── */
  const handleComment = async () => {
    if (!auth?.token) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${url}/blog/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth?.token },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) {
        if (res.status === 401) { alert('Please log in to comment'); return; }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        fetchBlog();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete Blog ── */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await deleteBlog(id);
      if (res.data && res.data.success) {
        toast.success("Blog deleted successfully");
        navigate("/blogs");
      } else {
        toast.error(res.data?.message || "Failed to delete blog");
      }
    } catch (err) {
      toast.error("Error deleting blog");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Pet Data ── */
  useEffect(() => {
    if (auth?.user?.id) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`${url}/user/${auth.user.id}`, {
            headers: auth?.token ? { Authorization: auth.token } : {}
          });
          const data = await res.json();
          if (data?.user?.focusPet) {
            setPetData(data.user.focusPet);
          } else if (data?.success) {
            setPetData({ level: 1, xp: 0, petType: 'seed' });
          }
        } catch (err) { }
      };
      fetchUser();
    }
  }, [auth?.user?.id, auth?.token]);

  useEffect(() => {
    let readTimer = 0;
    if (!auth?.token || xpAwarded || !blog) return;

    const interval = setInterval(() => {
      readTimer += 1;
      if (readTimer >= 30) {
        clearInterval(interval);
        awardBlogXP();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auth?.token, xpAwarded, blog]);

  const awardBlogXP = async () => {
    try {
      const res = await fetch(`${url}/user/pet/award-xp`, {
        method: 'POST',
        headers: { Authorization: auth.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'READ_BLOG' })
      });
      const data = await res.json();
      if (data.success) {
        setPetData(data.focusPet);
        setXpAwarded(true);
        if (data.leveledUp) {
          setLevelUpData(data.focusPet);
        } else {
          toast.success(data.message || 'Focus Pet gained XP for reading!', { duration: 3000 });
        }
        (data.newBadges || []).forEach((b, idx) => {
          if (idx === 0) setUnlockedBadge(b);
          toast.success(`🏅 New Badge: ${b.icon} ${b.name}!`, { duration: 5000 });
        });
      }
    } catch (e) { }
  };

  /* ── States ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <SplashCursor />
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading article…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <SplashCursor />
        <span className={styles.errorIcon}>😕</span>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => window.location.reload()}>
          ↺ Try Again
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.emptyContainer}>
        <SplashCursor />
        <span className={styles.emptyIcon}>📄</span>
        <p>Blog post not found.</p>
      </div>
    );
  }

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    : null;

  const tags = blog.tags ? blog.tags.split(',').map(t => t.trim()) : [];

  /* ── Render Series Navigation ── */
  const renderSeriesNav = (isTop = false) => {
    if (!seriesData || !seriesData.blogs) return null;
    const chapters = seriesData.blogs;
    const currentIdx = chapters.findIndex(b => b._id === blog._id);
    const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
    const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

    return (
      <div style={{
        marginTop: isTop ? '0' : '2rem',
        marginBottom: isTop ? '2rem' : '0',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)',
        borderRadius: '12px',
        border: '1px solid #3182ce',
      }}>
        {/* Series title + dropdown */}
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <span className={styles.seriesTitlePrefix} style={{ color: '#90cdf4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📚 {seriesData.series.title}
          </span>
          <div style={{ marginTop: '0.6rem' }}>
            <select
              value={blog._id}
              onChange={(e) => navigate(`/blog/${e.target.value}`)}
              className={styles.chapterSelect}
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: '#e2e8f0',
                border: '1px solid rgba(74, 144, 217, 0.4)',
                padding: '0.5rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                maxWidth: '100%',
                outline: 'none',
              }}
            >
              {chapters.map((ch, i) => (
                <option key={ch._id} value={ch._id} style={{ background: '#080d1a', color: '#e2e8f0' }}>
                  Chapter {ch.chapterNumber ?? i + 1} of {chapters.length}: {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prev / Next buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => prevChapter && navigate(`/blog/${prevChapter._id}`)}
            disabled={!prevChapter}
            className={styles.seriesNavBtn}
            style={{
              flex: 1, padding: '0.6rem 1rem',
              background: prevChapter ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              color: prevChapter ? '#e2e8f0' : '#718096',
              border: '1px solid ' + (prevChapter ? '#4a90d9' : '#2d3748'),
              borderRadius: '8px', cursor: prevChapter ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              textAlign: 'left',
            }}
            onMouseEnter={e => prevChapter && (e.currentTarget.style.background = 'rgba(49,130,206,0.3)')}
            onMouseLeave={e => e.currentTarget.style.background = prevChapter ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
          >
            <div className={styles.seriesNavMainText}>
              ← Prev{prevChapter ? `: Ch ${prevChapter.chapterNumber}` : ''}
            </div>
            {prevChapter && <div className={styles.seriesNavSubtitle}>{prevChapter.title}</div>}
          </button>

          <button
            onClick={() => nextChapter && navigate(`/blog/${nextChapter._id}`)}
            disabled={!nextChapter}
            className={styles.seriesNavBtn}
            style={{
              flex: 1, padding: '0.6rem 1rem',
              background: nextChapter ? 'rgba(49,130,206,0.25)' : 'rgba(255,255,255,0.04)',
              color: nextChapter ? '#e2e8f0' : '#718096',
              border: '1px solid ' + (nextChapter ? '#4a90d9' : '#2d3748'),
              borderRadius: '8px', cursor: nextChapter ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              textAlign: 'right',
            }}
            onMouseEnter={e => nextChapter && (e.currentTarget.style.background = 'rgba(49,130,206,0.5)')}
            onMouseLeave={e => e.currentTarget.style.background = nextChapter ? 'rgba(49,130,206,0.25)' : 'rgba(255,255,255,0.04)'}
          >
            <div className={styles.seriesNavMainText}>
              Next{nextChapter ? `: Ch ${nextChapter.chapterNumber}` : ''} →
            </div>
            {nextChapter && <div className={styles.seriesNavSubtitle}>{nextChapter.title}</div>}
          </button>
        </div>
      </div>
    );
  };

  /* ── Render ── */
  return (
    <div className={styles.shell}>
      <SplashCursor />
      {levelUpData && (
        <LevelUpCard
          focusPet={levelUpData}
          userName={auth?.user?.name}
          onClose={() => setLevelUpData(null)}
        />
      )}
      {unlockedBadge && (
        <BadgeUnlockCard
          badge={unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
        />
      )}
      {/* ── Hero ── */}
      {blog.thumbnail ? (
        <div className={styles.heroBanner}>
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className={styles.heroImg}
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-blog.jpg'; }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.heroMeta}>
              {tags.length > 0 && (
                <span className={styles.heroLabel}>{tags[0]}</span>
              )}
              {formattedDate && (
                <span className={styles.heroDate}>{formattedDate}</span>
              )}
            </div>
            <h1 className={styles.heroTitle}>{blog.title}</h1>
          </div>
          {(auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin') && (
            <button
              onClick={handleDelete}
              className={styles.deleteBlogBtn}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', zIndex: 10, fontWeight: 'bold' }}
            >
              Delete Blog
            </button>
          )}
        </div>
      ) : (
        <div className={styles.noThumbnailHeader}>
          {tags.length > 0 && (
            <span className={styles.noThumbnailLabel}>{tags[0]}</span>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className={styles.noThumbnailTitle}>{blog.title}</h1>
            {(auth?.user?.role === 'admin' || auth?.user?.role === 'superAdmin') && (
              <button
                onClick={handleDelete}
                className={styles.deleteBlogBtn}
                style={{ background: 'red', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Delete
              </button>
            )}
          </div>
          {formattedDate && (
            <p className={styles.noThumbnailDate}>{formattedDate}</p>
          )}
        </div>
      )}

      {/* ── Article body ── */}
      <div className={styles.container}>

        {/* Content card */}
        <div className={styles.contentCard}>
          {renderSeriesNav(true)}

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className={styles.tagsSection}>
              {tags.map((t, i) => (
                <span key={i} className={styles.tag}>#{t}</span>
              ))}
            </div>
          )}

          {/* Series Navigation (Bottom) */}
          {renderSeriesNav(false)}
        </div>

        {/* Reactions bar */}
        <div className={styles.reactionsCard}>
          <button
            className={`${styles.reactionBtn} ${styles.likeBtn} ${userReaction === 'like' ? styles.active : ''}`}
            onClick={() => handleReaction('like')}
          >
            👍 Like
            {likes > 0 && <span className={styles.count}>{likes}</span>}
          </button>

          <button
            className={`${styles.reactionBtn} ${styles.dislikeBtn} ${userReaction === 'dislike' ? styles.active : ''}`}
            onClick={() => handleReaction('dislike')}
          >
            👎 Dislike
            {dislikes > 0 && <span className={styles.count}>{dislikes}</span>}
          </button>

          <button className={styles.showReactionsBtn} onClick={fetchReactionDetails}>
            👥 Who reacted
          </button>

          <div style={{ marginLeft: 'auto' }}>
            <FocusPet petData={petData} />
          </div>
        </div>

        {/* Comments card */}
        <div className={styles.commentsCard}>
          <h3 className={styles.commentsTitle}>
            💬 Comments
            <span className={styles.commentCount}>
              {blog.comments?.length || 0}
            </span>
          </h3>

          {/* Comment list */}
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment, index) => {
              const author = comment.userId?.name || comment.userId?.username || 'Anonymous';
              return (
                <div key={index} className={styles.comment} style={{ animationDelay: `${index * 60}ms` }}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentAuthorRow}>
                      <Avatar name={author} className={styles.commentAvatar} />
                      <span className={styles.commentAuthor}>{author}</span>
                    </div>
                    <span className={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              );
            })
          ) : (
            <div className={styles.noComments}>
              <span className={styles.noCommentsIcon}>💭</span>
              No comments yet. Be the first to share your thoughts!
            </div>
          )}

          {/* Inline comment form */}
          <div className={styles.commentForm}>
            <p className={styles.commentFormTitle}>Leave a comment</p>
            <textarea
              className={styles.commentTextarea}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
            />
            <button
              className={styles.submitComment}
              onClick={handleComment}
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? 'Posting…' : '✈ Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Reaction details modal */}
      {showReactionDetails && (
        <div className={styles.modalOverlay} onClick={() => setShowReactionDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowReactionDetails(false)}>
              ×
            </button>
            <h3 className={styles.modalTitle}>Reactions</h3>

            <div className={styles.reactionSection}>
              <p className={styles.reactionSectionTitle}>
                👍 Liked by ({reactionDetails.likes.length})
              </p>
              {reactionDetails.likes.length > 0 ? (
                <ul className={styles.userList}>
                  {reactionDetails.likes.map((user, i) => (
                    <li key={i}>
                      <Avatar
                        name={user.name || user.username}
                        className={styles.userListAvatar}
                      />
                      {user.name || user.username || 'Anonymous'}
                    </li>
                  ))}
                </ul>
              ) : <p>No likes yet</p>}
            </div>

            <div className={styles.reactionSection}>
              <p className={styles.reactionSectionTitle}>
                👎 Disliked by ({reactionDetails.dislikes.length})
              </p>
              {reactionDetails.dislikes.length > 0 ? (
                <ul className={styles.userList}>
                  {reactionDetails.dislikes.map((user, i) => (
                    <li key={i}>
                      <Avatar
                        name={user.name || user.username}
                        className={styles.userListAvatar}
                      />
                      {user.name || user.username || 'Anonymous'}
                    </li>
                  ))}
                </ul>
              ) : <p>No dislikes yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogItem;