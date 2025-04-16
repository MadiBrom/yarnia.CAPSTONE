import React, { useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({
  value,
  onChange,
  height = "200px",
}) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .ql-container {
        border: none !important;
      }
      .ql-editor {
        padding: 1rem !important;
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative rounded border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark shadow-sm">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ header: "1" }, { header: "2" }, { font: [] }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image", "video"],
            ["clean"],
          ],
        }}
        formats={[
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "indent",
          "link",
          "image",
          "video",
        ]}
        theme="snow"
        style={{ height }}
        className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
      />
    </div>
  );
};

export default RichTextEditor;
