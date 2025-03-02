const express = require("express");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is running...");
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
