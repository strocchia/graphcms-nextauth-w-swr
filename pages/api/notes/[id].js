import { gql } from "graphql-request";
import { getSession } from "next-auth/react";

import { graphcmsClient } from "../../../lib/graphcms";

const UpdateNoteById = gql`
  mutation UpdateNoteById($id: ID!, $title: String!, $mcontent: String) {
    note: updateNote(
      where: { id: $id }
      data: { title: $title, mcontent: $mcontent }
    ) {
      id
      title
      mcontent
      createdAt
      updatedAt
      content {
        raw
      }
    }
  }
`;

const UpdateNoteByUserById = gql`
  mutation UpdateNoteByUserById(
    $id: ID!
    $title: String!
    $mcontent: String
    $userId: ID!
  ) {
    note: updateNote(
      where: { id: $id }
      data: {
        title: $title
        mcontent: $mcontent
        nextAuthUser: { connect: { id: $userId } }
      }
    ) {
      id
      title
      mcontent
      createdAt
      updatedAt
    }
  }
`;

const DeleteNoteById = gql`
  mutation DeleteNoteById($id: ID!) {
    deleteNote(where: { id: $id }) {
      id
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
    case "PATCH": {
      const { id } = req.query;
      const { title, mcontent } = req.body;

      // Check is owner?

      const { note } = await graphcmsClient.request(UpdateNoteById, {
        id,
        title,
        mcontent,
        // userId: session.userId,
      });

      res.status(200).json(note);
      break;
    }

    case "DELETE": {
      const { id } = req.query;

      // Check is owner?

      await graphcmsClient.request(DeleteNoteById, {
        id,
      });

      res.status(204).send();
      break;
    }

    default: {
      res.status(405).send();
    }
  }
};
