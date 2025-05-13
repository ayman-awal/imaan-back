const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sendEmail = require("../utils/sendEmail");


exports.emailVerification = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user){
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Email successfully verified!",
      html: '<p>You have been verified. Welcome to ImaanWeb!</p>'
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}