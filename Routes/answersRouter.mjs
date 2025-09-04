import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouters = Router();

answersRouters.get("/test", async (req, res) => {
  const client = await connectionPool.connect();
  client.release();
  return res.json("Database Connected 🚀");
});

answersRouters.post("/:answerId/vote", async (req, res) => {
  try {
    const voteItem = {
      ...req.body,
    };

    const answerIdFromClient = req.params.answerId;

    //search answer

    const search_answer = await connectionPool.query(
      `select * from answers where id=$1`,
      [answerIdFromClient]
    );

    if (search_answer.rowCount > 0) {
      const result = await connectionPool.query(
        `insert into answer_votes (answer_id, vote)
      values ($1, $2)`,
        [answerIdFromClient, voteItem.vote]
      );

      if (result.rowCount <= 0) {
        return res.status(400).json({ message: "Invalid vote value." });
      }
    } else {
      return res
        .status(404)
        .json({ message: `Question not found. ID : ${answerIdFromClient}` });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to create answers." });
  }

  return res
    .status(200)
    .json({ message: "Vote on the question has been recorded successfully." });
});

export default answersRouters;
