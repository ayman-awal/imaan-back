const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.userRegister = async (req, res) => {
  try {
    const { name, email, password, user_type } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, user_type },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        userType: existingUser.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.email },
    });

    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    const [answered, unanswered] = posts.reduce(
      ([answered, unanswered], post) => {
        if (post.status == "published") {
          answered.push(post);
        } else {
          unanswered.push(post);
        }
        return [answered, unanswered];
      },
      [[], []]
    );

    return res.status(200).json({
      message: "Profile found",
      user: {
        name: user.name,
        email: user.email,
        accountCreated: user.createdAt,
        role: user.user_type,
      },
      posts: {
        answered,
        unanswered,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.getProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const posts = await prisma.post.findMany({
      where: { userId },
    });

    return res
      .status(200)
      .json({
        message: "Profile found",
        user: {
          name: user.name,
          email: user.email,
          accountCreated: user.createdAt,
          role: user.user_type,
        },
        posts: posts,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
