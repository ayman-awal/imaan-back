const express = require("express");
const cors = require("cors");
const userRoutes = require('./src/routers/users');
const postRoutes = require('./src/routers/posts');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
