import React, { createContext, useContext, useEffect, useState } from 'react'

// creating auth context
const BlogContext = createContext();

export const BlogProvider = ({children})=> {
    const [blog , setBlog] = useState({
        title : "",
        tags : "",
        value : ""
    });

    useEffect(() => {
        try {
          const data = localStorage.getItem('blog');
          const parsedData = JSON.parse(data);
          if (parsedData) {
            setBlog(parsedData);
          }
        } catch (error) {
          console.error("Error parsing blog data from localStorage", error);
        }
      }, []);

    return (
        <BlogContext.Provider value={[blog , setBlog]}>
            {children}
        </BlogContext.Provider>
    )
}


// Custom Hook
export const useBlog = ()=> useContext(BlogContext);

