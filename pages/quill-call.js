import React, { useState } from "react";
import useSWR, { mutate } from "swr";

import { useSession } from "next-auth/react";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

import parse from "html-react-parser";

// import { useRouter } from "next/router";

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

import Header from "../components/header";
import Notes from "../components/notes";
import QuillCustomEditor from "../components/quill-editor";

const jsonFetcher = async (url) => {
  const res = await fetch(url);
  return res.json();
};

export default function MyQuill() {
  const { data: session, status } = useSession();

  // const router = useRouter();

  // const [title, setTitle] = useState("");
  // const [value, setValue] = useState("");

  const [isShow, setShow] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editNote, setEditNote] = useState(null);

  const { data } = useSWR("/api/notes", jsonFetcher);

  if (!session) {
    return (
      <div>
        <Header />
        <p className="text-center">Login to see what is here...</p>
      </div>
    );
  }

  if (!data) {
    return <p className="mx-8">Fetching notes from GraphCMS...</p>;
  }

  const addNote = async (title_arg, value_arg) => {
    setEditMode(false);

    /*
    // const optimisticItem = {
    //   id: Math.random(),
    //   title,
    //   mcontent: value,
    // };

    // mutate("/api/notes", [...data, optimisticItem], false);
    */

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title_arg,
        mcontent: value_arg,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const newItem = await response.json();

    console.log("new Item", newItem);

    await mutate(
      "/api/notes",
      (existingData) => {
        const newData = [];

        // push the new item first
        newData.push(newItem);

        for (const item of existingData) {
          newData.push(item);
          console.log(item);
          console.log(newData);
        }

        return newData;
      },
      false
    );

    // setTitle("");
    // setValue("");
  };

  const setupEditing = (note) => {
    // setTitle(note.title);
    // setValue(note.mcontent);

    setEditMode(true);
    setEditNote(note);

    setShow(true);
  };

  const updateNote = async (passed_title, passed_value) => {
    console.log(editNote);

    const response = await fetch(`/api/notes/${editNote.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ ...editNote, title: title, mcontent: value }),
      body: JSON.stringify({
        ...editNote,
        title: passed_title,
        mcontent: passed_value,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const updatedItem = await response.json();

    await mutate(
      "/api/notes",
      (existingData) =>
        existingData.map((item) =>
          item.id === editNote.id ? updatedItem : item
        ),
      false
    );

    setEditNote(null);
    setEditMode(false);
    setShow(false);
  };

  const deleteNote = async (id) => {
    console.log(id);

    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    mutate(
      "/api/notes",
      data.filter((item) => item.id !== id),
      false
    );
  };

  const resetFields = () => {
    setEditNote(null);
    setEditMode(false);
    setShow(false);
  };

  const toggleButton = () => {
    setShow(!isShow);
    setEditMode(false);
    setEditNote(null);

    // if (editMode) {
    //   handleFormClear();
    // }
  };

  return (
    <div>
      <Header />
      <div className="mx-8">
        <Notes
          data={data}
          setupEditing={setupEditing}
          deleteNote={deleteNote}
        />
        <div>
          {!isShow && (
            <button
              className="mt-8 bg-green-200 p-2 inline-block rounded hover:bg-green-500"
              onClick={toggleButton}
            >
              <span>
                <span className="mr-3">👇</span>
                Add 1 <small className="ml-3">[ +1 ]</small>
              </span>
            </button>
          )}
        </div>
        {isShow && (
          <div>
            <QuillCustomEditor
              editMode={editMode}
              editNote={editNote}
              addNote={addNote}
              updateNote={updateNote}
              resetFields={resetFields}
            />
          </div>
        )}
      </div>
    </div>
  );
}
