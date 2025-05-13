const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");

exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if(!passwordMatch){
      return res.status(400).json({ message: "Current password is wrong" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedPassword = await prisma.user.update({
      where: { id: Number(userId) },
      data: { 
          password: hashedPassword
       }
    });

    return res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

exports.userRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, gender, dateOfBirth,  password, user_type } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, gender, dateOfBirth: new Date(dateOfBirth), password: hashedPassword, user_type: "user", emailVerifyToken: token, emailVerifyTokenExpiry: new Date(expiry) },
    });

    await sendEmail({
      to: newUser.email,
      subject: "Verify your email",
      html: `<p>Click to verify your email: 
              <a href="http://localhost:5001/api/auth/verify-email?token=${token}">
                Verify Email
              </a>
            </p>`,
    });


    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
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

    const userId = req.userId;

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

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: parseInt(userId) },
      include: { post: true },
      orderBy: {
          createdAt: "desc"
      }
    });

    const bookmarkedPosts = bookmarks.map(b => b.post);

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
        bookmarks: bookmarkedPosts
      }
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
