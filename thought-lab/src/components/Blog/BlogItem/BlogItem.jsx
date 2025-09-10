import React, { useEffect, useState } from 'react';
import styles from './BlogItem.module.css';
import { url } from '../../../url';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';

const BlogItem = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [reactionDetails, setReactionDetails] = useState({ likes: [], dislikes: [] });
  const [auth, setAuth] = useAuth()
  const { id } = useParams();

  // Function to fetch blog data
  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token
      const headers = (auth?.token) ? { 
        'Authorization': `${auth?.token}`,
        'Content-Type': 'application/json'
      } : { 'Content-Type': 'application/json' };
      
      const res = await fetch(`${url}/all-blogs/${id}`, { headers });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data?.blog) {
        setBlog(data.blog);
        setLikes(data.blog.likes || 0);
        setDislikes(data.blog.dislikes || 0);
        setUserReaction(data.userReaction || null);
      } else {
        throw new Error('Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleReaction = async (type) => {
    try {
      const res = await fetch(`${url}/blog/${id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth?.token
        },
        body: JSON.stringify({ type })
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          alert('Please log in to react to posts');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserReaction(data.userReaction);
    } catch (error) {
      console.error('Error updating reaction:', error);
      alert('Failed to update reaction');
    }
  };

  const fetchReactionDetails = async () => {
    try {
      const headers = { 
        'Authorization': auth?.token,
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`${url}/blog/${id}/reactions`, { headers });
      
      if (!res.ok) {
        if (res.status === 401) {
          alert('Please log in to view reaction details');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setReactionDetails(data);
      setShowReactionDetails(true);
    } catch (error) {
      console.error('Error fetching reaction details:', error);
      alert('Failed to load reaction details');
    }
  };

  const handleComment = async () => {
    try {  
      const commentContent = prompt('Enter your comment:');
      if (!commentContent) return;
      
      const res = await fetch(`${url}/blog/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth?.token
        },
        body: JSON.stringify({ content: commentContent })
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          alert('Please log in to comment');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        alert('Comment added successfully!');
        // Refresh the blog data to show the new comment
        fetchBlog();
      } else {
        alert('Failed to add comment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.emptyContainer}>
        <p>Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{blog.title}</h1>
        {blog.createdAt && (
          <div className={styles.date}>
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>

      {blog.thumbnail && (
        <img 
          src={blog.thumbnail} 
          alt={blog.title} 
          className={styles.thumbnail}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-blog.jpg';
          }}
        />
      )}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: blog.content }}
      ></div>

      {blog.tags && (
        <div className={styles.tags}>
          {blog.tags.split(', ').map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <button 
          className={`${styles.reactionBtn} ${styles.likeBtn} ${userReaction === 'like' ? styles.active : ''}`}
          onClick={() => handleReaction('like')}
        >
          👍 Like {likes > 0 && <span className={styles.count}>{likes}</span>}
        </button>
        <button 
          className={`${styles.reactionBtn} ${styles.dislikeBtn} ${userReaction === 'dislike' ? styles.active : ''}`}
          onClick={() => handleReaction('dislike')}
        >
          👎 Dislike {dislikes > 0 && <span className={styles.count}>{dislikes}</span>}
        </button>
        
        {/* Show who reacted button */}
        <button 
          className={styles.showReactionsBtn}
          onClick={fetchReactionDetails}
        >
          👥 Show Reactions
        </button>
        
        <button 
          className={`${styles.reactionBtn} ${styles.commentBtn}`}
          onClick={handleComment}
        >
          💬 Comment
        </button>
      </div>

      {/* Display comments if they exist */}
      {blog.comments && blog.comments.length > 0 && (
        <div className={styles.commentsSection}>
          <h3>Comments ({blog.comments.length})</h3>
          {blog.comments.map((comment, index) => (
            <div key={index} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>
                  {comment.userId?.name || comment.userId?.username || 'Anonymous'}
                </span>
                <span className={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Show message if no comments */}
      {(!blog.comments || blog.comments.length === 0) && (
        <div className={styles.commentsSection}>
          <h3>Comments (0)</h3>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}

      {/* Reaction details modal */}
      {showReactionDetails && (
        <div className={styles.modalOverlay} onClick={() => setShowReactionDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeModal}
              onClick={() => setShowReactionDetails(false)}
            >
              &times;
            </button>
            
            <h3>Reactions</h3>
            
            <div className={styles.reactionSection}>
              <p className={styles.arr}>Liked by ({reactionDetails.likes.length})</p>
              {reactionDetails.likes.length > 0 ? (
                <ul className={styles.userList}>
                  {reactionDetails.likes.map((user, index) => (
                    <li key={index}>{user.name || user.username || 'Anonymous'}</li>
                  ))}
                </ul>
              ) : (
                <p>No likes yet</p>
              )}
            </div>
            
            <div className={styles.reactionSection}>
              <p className={styles.arr}>Disliked by ({reactionDetails.dislikes.length})</p>
              {reactionDetails.dislikes.length > 0 ? (
                <ul className={styles.userList}>
                  {reactionDetails.dislikes.map((user, index) => (
                    <li key={index}>{user.name || user.username || 'Anonymous'}</li>
                  ))}
                </ul>
              ) : (
                <p>No dislikes yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogItem;