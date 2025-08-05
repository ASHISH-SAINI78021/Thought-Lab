import React, { useEffect, useState } from 'react';
import styles from './BlogItem.module.css';
import { url } from '../../../url';
import { useParams } from 'react-router-dom';

const BlogItem = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${url}/all-blogs/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data?.blog) {
          setBlog(data.blog);
          setLikes(data.blog.likes || 0);
          setDislikes(data.blog.dislikes || 0);
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

    fetchBlog();
  }, [id]);

  const handleReaction = (type) => {
    if (userReaction === type) {
      // If clicking the same reaction again, remove it
      setUserReaction(null);
      if (type === 'like') setLikes(prev => prev - 1);
      if (type === 'dislike') setDislikes(prev => prev - 1);
    } else {
      // If changing reaction
      if (type === 'like') {
        setLikes(prev => prev + 1);
        if (userReaction === 'dislike') setDislikes(prev => prev - 1);
      } else {
        setDislikes(prev => prev + 1);
        if (userReaction === 'like') setLikes(prev => prev - 1);
      }
      setUserReaction(type);
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
        {blog.date && (
          <div className={styles.date}>
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>

      {/* {blog.thumbnail && (
        <img 
          src={`${url}${blog.thumbnail}`} 
          alt={blog.title} 
          className={styles.thumbnail}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-blog.jpg';
          }}
        />
      )} */}

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
        <button className={`${styles.reactionBtn} ${styles.commentBtn}`}>
          💬 Comment
        </button>
      </div>
    </div>
  );
};

export default BlogItem;