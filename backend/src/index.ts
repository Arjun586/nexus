import express from "express";

const app = express();

app.get("/", (_, res) => {
    res.send("Backend running");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});