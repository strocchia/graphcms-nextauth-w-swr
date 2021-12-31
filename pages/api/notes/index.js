// api/todos/notes.js

import { gql } from "graphql-request";
import { getSession } from "next-auth/react";

import { graphcmsClient } from "../../../lib/graphcms";

const GetAllNotes = gql`
  query GetAllNotes {
    notes(orderBy: updatedAt_DESC) {
      id
      title
      mcontent
      createdAt
      updatedAt
      content {
        html
        markdown
        raw
        text
      }
      nextAuthUser {
        email
      }
    }
  }
`;

// const GetAllNotesByUser = gql`
//   query GetAllNotesByUser($userId: ID!) {
//     notes(where: { nextAuthUser: { id: $userId } }, orderBy: createdAt_ASC) {
//       id
//       title
//       content
//       mcontent
//     }
//   }
// `;

const CreateNewNote = gql`
  mutation CreateNewNote($title: String!, $mcontent: String) {
    note: createNote(data: { title: $title, mcontent: $mcontent }) {
      id
      title
      mcontent
      createdAt
      updatedAt
    }
  }
`;

const CreateNewNoteForUser = gql`
  mutation CreateNewNoteForUser(
    $title: String!
    $content: RichTextAST
    $mcontent: String
    $userId: ID
  ) {
    note: createNote(
      data: {
        title: $title
        content: $content
        mcontent: $mcontent
        nextAuthUser: { connect: { id: $userId } }
      }
    ) {
      id
      title
      mcontent
      createdAt
      updatedAt
      content {
        html
        markdown
        raw
        text
      }
    }
  }
`;

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).send({
      error: "Unauthorized",
    });
  }

  switch (req.method) {
    case "GET": {
      const { notes } = await graphcmsClient.request(GetAllNotes);

      res.status(201).json(notes);

      break;
    }
    case "POST": {
      console.log(req.body);

      const { note } = await graphcmsClient.request(CreateNewNote, {
        title: req.body.title,
        mcontent: req.body.mcontent,
      });

      res.status(201).json(note);

      break;
    }
    default:
      res.status(405).send();
  }
};
