import e, { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreatePostData } from "./middlewares/post.validation.mjs"

const questionsRouters = Router();

questionsRouters.get("/test", async (req, res) => {
  const client = await connectionPool.connect();
  client.release();
  return res.json("Database Connected 🚀");
});

questionsRouters.post("/", [validateCreatePostData], async (req, res) => {
  try {
    const newQuestion = {
      ...req.body,
    };

    const result = await connectionPool.query(
      `insert into questions (title, description, category)
    values ($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );

    if (result.error) {
      return res.status(400).json({
        message: "Invalid request data.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create question.",
    });
  }
  return res.status(201).json({
    message: "Question created successfully.",
  });
});

questionsRouters.get("/", async (req, res) => {
  let results;

  try {
    results = await connectionPool.query(`select * from questions `);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
  return res.status(200).json({
    data: results.rows,
  });
});

questionsRouters.get("/questions/:questionId", async (req, res) => {
  let results;
  const questionIdFromClient = req.params.questionId;

  try {
    results = await connectionPool.query(
      `select * from questions where id=$1`,
      [questionIdFromClient]
    );
    if (!results.rows[0]) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`,
      });
    }
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
  return res.status(200).json({
    data: results.rows[0],
  });
});

questionsRouters.put("/:questionId", async (req, res) => {
  try {
    let result;
    const questionIdFromClient = req.params.questionId;
    const updatedQuestion = {
      ...req.body,
    };

    result = await connectionPool.query(
      `
        update questions
        set title = $2,
        description = $3,
        category = $4 
        where id = $1
      `,
      [
        questionIdFromClient,
        updatedQuestion.title,
        updatedQuestion.description,
        updatedQuestion.category,
      ]
    );

    if (result.error) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }

  return res.status(200).json({
    message: "Question updated successfully.",
  });
});

questionsRouters.delete("/:questionId", async (req, res) => {
  let results;
  const questionIdFromClient = req.params.questionId;

  try {
    results = await connectionPool.query(
      `delete from questions
       where id = $1`,
      [questionIdFromClient]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: `Question not found. (question id: ${questionIdFromClient})`,
      });
    }
  } catch (error) {
    //console.log(error);
    return res.status(500).json({
      message: "Unable to delete question.",
    });
  }
  return res.status(200).json({
    message: "Question post has been deleted successfully.",
  });
});

questionsRouters.get("/search", async (req, res) => {
  const { title, category } = req.body;

  if (!title && !category) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  try {
    let query = "SELECT * FROM questions";
    let conditions = [];
    let values = [];

    if (title) {
      conditions.push(`title ILIKE $${conditions.length + 1}`);
      values.push(`%${title}%`);
    }

    if (category) {
      conditions.push(`category ILIKE $${conditions.length + 1}`);
      values.push(`%${category}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await connectionPool.query(query, values);
    return res.status(200).json({ data: result.rows });
  } catch (err) {
    return res.status(500).json({ message: "Unable to fetch a question." });
  }
});

questionsRouters.post("/:questionId/answers", async (req, res) => {
  try {
    const newAnswer = {
      ...req.body,
    };

    const questIdFromClient = req.params.questionId;

    //search question

    const search_question = await connectionPool.query(
      `select * from questions where id=$1`,
      [questIdFromClient]
    );

    if (search_question.rowCount > 0) {
      const result = await connectionPool.query(
        `insert into answers (question_id, content)
      values ($1, $2)`,
        [questIdFromClient, newAnswer.content]
      );

      if (result.rowCount <= 0) {
        return res.status(400).json({ message: "Invalid request data." });
      }
    } else {
      return res.status(404).json({ message: "Question not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to create answers." });
  }

  return res.status(201).json({ message: "Answer created successfully." });
});

questionsRouters.get("/:questionId/answers", async (req, res) => {
  let result;
  try {
    const questIdFromClient = req.params.questionId;

    result = await connectionPool.query(
      `select * from answers where question_id=$1`,
      [questIdFromClient]
    );

    if (result.rowCount <= 0) {
      return res.status(400).json({ message: "Answers not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch answers." });
  }

  return res.status(200).json({
    data: result.rows,
  });
});

questionsRouters.delete("/:questionId/answers", async (req, res) => {
  let results;
  const questionIdFromClient = req.params.questionId;

  try {
    results = await connectionPool.query(
      `delete from answers
       where question_id = $1`,
      [questionIdFromClient]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: `Answer not found. (question id: ${questionIdFromClient})`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete answers.",
    });
  }
  return res.status(200).json({
    message: "All answers for the question have been deleted successfully.",
  });
});

questionsRouters.post("/:questionId/vote", async (req, res) => {
  try {
    const voteItem = {
      ...req.body,
    };

    const questIdFromClient = req.params.questionId;

    //search question

    const search_question = await connectionPool.query(
      `select * from questions where id=$1`,
      [questIdFromClient]
    );

    if (search_question.rowCount > 0) {
      const result = await connectionPool.query(
        `insert into question_votes (question_id, vote)
      values ($1, $2)`,
        [questIdFromClient, voteItem.vote]
      );

      if (result.rowCount <= 0) {
        return res.status(400).json({ message: "Invalid vote value." });
      }
    } else {
      return res.status(404).json({ message: "Question not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to create answers." });
  }

  return res
    .status(200)
    .json({ message: "Vote on the question has been recorded successfully." });
});

export default questionsRouters;
