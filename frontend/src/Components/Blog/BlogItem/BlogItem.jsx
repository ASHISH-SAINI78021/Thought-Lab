import React, { useEffect, useState } from 'react';
import styles from './BlogItem.module.css';
import {url} from '../../../url';
import { useParams } from 'react-router-dom';

const BlogItem = () => {
  const [blog, setBlog] = useState(null);
  const {id} = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${url}/all-blogs/${id}`);
        const data = await res.json();
        setBlog(data?.blog);
        console.log(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className={styles.container}>
      {blog ? (
        <>
          <h1 className={styles.title}>{blog.title}</h1>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          ></div>

          <div className={styles.tags}>Tags: {blog?.tags?.split(', ')}</div>

          <div className={styles.footer}>
            <button className={styles.likeBtn}>👍 Like</button>
            <button className={styles.dislikeBtn}>👎 Dislike</button>
            <button className={styles.commentBtn}>💬 Comment</button>
          </div>
        </>
      ) : (
        <p className={styles.loading}>Loading blog...</p>
      )}
    </div>
  );
};

export default BlogItem;
