import cors from "cors";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import Router from "./route";
const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API is running",
  });
});

app.use("/api", Router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
