import React, { useState } from "react";
import useSWR, { mutate } from "swr";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

import parse from "html-react-parser";

const QuillNoSSR = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading... </p>,
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    //[{ header: 1 }, { header: 2 }, { header: 3 }],
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
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

const QuillCustomEditor = ({
  editMode,
  editNote,
  addNote,
  updateNote,
  resetFields,
}) => {
  const [title, setTitle] = useState(editNote?.title ?? "");
  const [value, setValue] = useState(editNote?.mcontent ?? "");

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // if (editMode) updateNote();
    if (editMode) updateNote(title, value);
    else addNote(title, value);
  };

  const handleFormClear = (e) => {
    e.preventDefault();

    setTitle("");
    setValue("");
    resetFields();
  };

  return (
    <div className="mt-10 mb-8">
      <p className="mb-4 italic">{editMode ? "Now editing..." : null}</p>
      <form onSubmit={handleFormSubmit}>
        <div className="w-1/3 mb-4">
          <input
            className="w-full"
            type="text"
            placeholder="Title goes here..."
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-nowrap gap-x-8">
          <div className="w-1/2">
            <QuillNoSSR
              modules={modules}
              placeholder="riddle me this..."
              value={value}
              onChange={setValue}
              theme="snow"
            />
            <button
              className="mt-8 border border-zinc-400 rounded px-2 py-1.5 mr-3"
              type="submit"
            >
              {!editMode ? "Send it in!" : "Update"}
            </button>
            <button
              className="mt-8 border border-zinc-400 rounded px-2 py-1.5 mr-3"
              onClick={handleFormClear}
            >
              Cancel {!editMode ? "add" : "edit"}
            </button>
          </div>

          <div className="w-1/2">
            {value && (
              <>
                <span>RAW:</span>
                <p>{value}</p>
                <hr className="border-1 border-gray-500 my-4" />
                <span>PARSED / FORMATTED:</span>
                <div className="prose prose-sm">{parse(value)}</div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuillCustomEditor;
