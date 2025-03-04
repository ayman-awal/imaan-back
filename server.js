const express = require("express");
const cors = require("cors");
const userRoutes = require('./src/routers/users');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
