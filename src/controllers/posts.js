const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
    try {
        const { title, question, status, userId } = req.body;

        if(!title || !question){
            return res.status(400).json({message: 'Title and Question are required'});
        }

        const newPost = await prisma.post.create({
            data: { title, question, status, userId }
        })

        return res.status(201).json({message: 'Post created', newPost});

    } catch (error) {
        return res.status(400).json({message: 'Something went wrong', error: error.message});
    }
}