import React, { useEffect, useState } from 'react';
import styles from './BlogItem.module.css';
import { url } from '../../../url';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';

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
  const [auth] = useAuth();
  const { id } = useParams();

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
      } else {
        throw new Error('Blog not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlog(); }, [id]);

  /* ── Reaction ── */
  const handleReaction = async (type) => {
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

  /* ── States ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading article…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
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

  /* ── Render ── */
  return (
    <div className={styles.shell}>
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
        </div>
      ) : (
        <div className={styles.noThumbnailHeader}>
          {tags.length > 0 && (
            <span className={styles.noThumbnailLabel}>{tags[0]}</span>
          )}
          <h1 className={styles.noThumbnailTitle}>{blog.title}</h1>
          {formattedDate && (
            <p className={styles.noThumbnailDate}>{formattedDate}</p>
          )}
        </div>
      )}

      {/* ── Article body ── */}
      <div className={styles.container}>

        {/* Content card */}
        <div className={styles.contentCard}>
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