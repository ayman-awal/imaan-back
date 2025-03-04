const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

exports.userRegister = async (req, res) => {
    try {
        const { name, email, password, user_type } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, user_type }
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(!existingUser){
            res.status(400).json({ message: "Invalid email" });
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);

        if(!validPassword){
            res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful", token: token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}