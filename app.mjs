import express from "express";
import questionsRouters from "./Routes/questionsRouter.mjs";
import answersRouters from "./Routes/answersRouter.mjs";



const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", async (req, res) => {
  return res.json("Server API is working 🚀");
});

app.use("/questions", questionsRouters);
app.use("/answers", answersRouters);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
