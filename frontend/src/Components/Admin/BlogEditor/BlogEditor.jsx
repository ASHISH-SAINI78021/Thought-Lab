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
import { Upload } from "antd";
import { useBlog } from "../../../Context/blog";
import { url } from "../../../url";
import { message } from "antd";

const { Dragger } = Upload;

const BlogEditor = ({ check }) => {
  const [blog, setBlog] = useBlog();
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();
  const quill = useRef();

  const handleChange = (field, value) => {
    const updatedBlog = { ...blog, [field]: value };
    setBlog(updatedBlog);
    localStorage.setItem("blog", JSON.stringify(updatedBlog));
  };

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: (file) => {
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
      const reader = new FileReader();
  
      reader.onload = () => {
        const imageUrl = reader.result;
        const quillEditor = quill.current.getEditor();
        const range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, "image", imageUrl, "user");
  
        // Delay required for the image to be rendered
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
    const formData = new FormData();
    formData.append("title", blog.title);
    formData.append("tags", blog.tags);
    formData.append("thumbnail", blog.thumbnail);
    formData.append("content", blog.value);
  
    try {
      message.loading({ content: "Publishing blog...", key: "updatable" });
  
      let response = await fetch(`${url}/add-blog`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        response = await response.json();
        if (response.success) {
          message.success({ content: "Blog published successfully!", key: "updatable", duration: 2 });
          // setTimeout(() => navigate("/your-blog-list-or-home"), 2000); // optional redirect
        } else {
          message.error({ content: "Failed to publish blog.", key: "updatable", duration: 2 });
        }
      } else {
        message.error({ content: "Server error. Please try again later.", key: "updatable", duration: 2 });
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: "An error occurred.", key: "updatable", duration: 2 });
    }
  };
  

  return (
    <div className={styles.wrapper}>
      {check === "true" ? (
        <button onClick={() => navigate("/create-blog/full-screen")}>
          <FullscreenOutlined style={{ fontSize: "1.5rem" }} />{" "}
          <span className={styles.span}>Full Screen</span>
        </button>
      ) : (
        <button onClick={() => navigate("/admin/create-blog/full-screen")}>
          <FullscreenExitOutlined style={{ fontSize: "1.5rem" }} />{" "}
          <span className={styles.span}>Exit Full Screen</span>
        </button>
      )}

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
          Support for a single image. It won’t be uploaded now, just previewed.
        </p>
      </Dragger>

      {blog.thumbnail && (
        <div className={styles.thumbnailPreview}>
          <img src={URL.createObjectURL(blog.thumbnail)} alt="Thumbnail" />
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
          className="animate-button ml-[18px] text-[1.2em] rounded-full border-secondary text-secondary border-[1px] px-[2rem] py-[1vh] hover:border-primary hover:text-black"
        >
          {previewMode ? "Back to Edit" : "Preview"}
        </button>
        <button
          onClick={handleSubmit}
          className="animate-button ml-[18px] text-[1.2em] rounded-full border-secondary text-secondary border-[1px] px-[2rem] py-[1vh] hover:border-primary hover:text-black"
        >
          Publish Blog
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;
