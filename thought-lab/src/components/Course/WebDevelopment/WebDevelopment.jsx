import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QuillEditor from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./BlogEditor.module.css";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Upload, message } from "antd";
import { useBlog } from "../../../Context/blog";
import { useAuth } from "../../../Context/auth";
import { addBlog } from "../../../http";

const { Dragger } = Upload;

const WebDevelopment = ({ check }) => {
  const [blog, setBlog] = useBlog();
  const [previewMode, setPreviewMode] = useState(false);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const quill = useRef();
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    if (blog.thumbnail && blog.thumbnail instanceof File) {
      const objectUrl = URL.createObjectURL(blog.thumbnail);
      setThumbnailPreviewUrl(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (typeof blog.thumbnail === "string") {
      setThumbnailPreviewUrl(blog.thumbnail);
    } else {
      setThumbnailPreviewUrl("");
    }
  }, [blog.thumbnail]);

  const handleChange = (field, value) => {
    const updatedBlog = { ...blog, [field]: value };
    setBlog(updatedBlog);
    localStorage.setItem("blog", JSON.stringify(updatedBlog));
  };

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: (file) => {
      // Validate that the file is an image
      if (!file.type.startsWith('image/')) {
        message.error('You can only upload image files!');
        return false;
      }
      handleChange("thumbnail", file);
      return false;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  
    input.onchange = () => {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        message.error('You can only upload image files!');
        return;
      }
      
      const reader = new FileReader();
  
      reader.onload = () => {
        const imageUrl = reader.result;
        const quillEditor = quill.current.getEditor();
        const range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, "image", imageUrl, "user");
  
        setTimeout(() => {
          const img = quillEditor.container.querySelector(`img[src="${imageUrl}"]`);
          if (img) {
            img.style.maxWidth = "200px";
            img.style.height = "auto";
            img.style.display = "block";
            img.style.margin = "10px auto";
          }
        }, 100);
      };
  
      reader.readAsDataURL(file);
    };
  }, []);
  

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    [imageHandler]
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "video",
    "clean",
  ];

  const handleSubmit = async () => {
    if (!blog.title || !blog.value) {
      message.error("Title and content are required!");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", blog.title);
    formData.append("tags", blog.tags);
    
    
    if (blog.thumbnail instanceof File) {
      formData.append("thumbnail", blog.thumbnail);
    }
    
    formData.append("content", blog.value);
  
    try {
      setLoading(true);
      message.loading({ content: "Publishing blog...", key: "updatable" });

      const response = await addBlog(formData);
      
      if (response.success) {
        message.success({ 
          content: "Blog published successfully!", 
          key: "updatable", 
          duration: 2 
        });
        
        setBlog({
          title: "",
          tags: "",
          thumbnail: null,
          value: ""
        });
        localStorage.removeItem("blog");
      } else {
        message.error({ 
          content: response.message || "Failed to publish blog.", 
          key: "updatable", 
          duration: 2 
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response?.status !== 401) {
        message.error({ 
          content: error.response?.data?.message || "An error occurred while publishing the blog.", 
          key: "updatable", 
          duration: 2 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFullScreenToggle = () => {
    if (check === "true") {
      navigate("/admin/create-blog"); // Exit full screen
    } else {
      navigate("/admin/create-blog/full-screen"); // Enter full screen
    }
  };

  return (
    <div className={styles.wrapper}>
      <button onClick={handleFullScreenToggle}>
        {check === "true" ? (
          <>
            <FullscreenExitOutlined style={{ fontSize: "1.5rem" }} />
            <span className={styles.span}>Exit Full Screen</span>
          </>
        ) : (
          <>
            <FullscreenOutlined style={{ fontSize: "1.5rem" }} />
            <span className={styles.span}>Full Screen</span>
          </>
        )}
      </button>

      <input
        className={styles.input}
        type="text"
        placeholder="Blog Title"
        value={blog.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      <input
        className={styles.input}
        type="text"
        placeholder="Tags (comma separated)"
        value={blog.tags}
        onChange={(e) => handleChange("tags", e.target.value)}
      />

      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single image. It won't be uploaded now, just previewed.
        </p>
      </Dragger>

      {thumbnailPreviewUrl && (
        <div className={styles.thumbnailPreview}>
          <img src={thumbnailPreviewUrl} alt="Thumbnail preview" />
          <button 
            onClick={() => {
              handleChange("thumbnail", null);
              setThumbnailPreviewUrl("");
            }}
            className={styles.removeThumbnailBtn}
          >
            Remove Thumbnail
          </button>
        </div>
      )}

      {!previewMode ? (
        <>
          <label className={styles.label}>Editor Content</label>
          <QuillEditor
            ref={(el) => (quill.current = el)}
            className={styles.editor}
            theme="snow"
            value={blog.value}
            formats={formats}
            modules={modules}
            onChange={(val) => handleChange("value", val)}
          />
        </>
      ) : (
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: blog.value }}
        />
      )}

      <div className={styles.btnGroup}>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="animate-button ml-[18px] text-[1.2em] rounded-full border-secondary text-secondary border-[1px] px-[2rem] py-[1vh] hover:border-primary hover:text-black cursor-pointer"
          disabled={loading}
        >
          {previewMode ? "Back to Edit" : "Preview"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !blog.title || !blog.value}
          className="animate-button ml-[18px] text-[1.2em] rounded-full border-secondary text-secondary border-[1px] px-[2rem] py-[1vh] hover:border-primary hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish Blog"}
        </button>
      </div>
    </div>
  );
};

export default WebDevelopment;