import { useState } from "react";

import parse from "html-react-parser";

const OneNote = ({ item, doEdit, doDelete }) => {
  const [expand, setExpand] = useState(false);

  return (
    <div
      className="p-4 border border-solid border-stone-300 rounded-lg max-w-3xl"
      key={item.id}
    >
      <h1>{item.title}</h1>
      <span className="text-sm text-gray-500 mr-10">
        {new Date(item.createdAt).toLocaleString()}
      </span>
      <span className="text-sm text-gray-500 mr-10">
        {new Date(item.updatedAt).toLocaleString()}
      </span>
      <button
        className="text-sm border px-2 mr-4"
        onClick={() => setExpand(!expand)}
      >
        {!expand ? "Expand" : "Contract"}
      </button>
      <button
        className="text-green-700 font-semibold text-sm border px-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          doEdit(item);
        }}
      >
        Edit
      </button>
      <button
        className="text-red-700 font-bold text-sm border rounded-sm px-2 mr-2"
        onClick={(e) => {
          e.preventDefault();
          const userConfirm = confirm(
            `Are you sure you want to delete ${item.id}?`
          );
          if (userConfirm) doDelete(item.id);
        }}
      >
        Delete
      </button>
      {expand && <div className="prose mt-4">{parse(item.mcontent || "")}</div>}
    </div>
  );
};

const Notes = ({ data, setupEditing, deleteNote }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, idx) => (
        <OneNote
          key={item.id || idx}
          item={item}
          doEdit={setupEditing}
          doDelete={deleteNote}
        />
      ))}
    </div>
  );
};

export default Notes;
