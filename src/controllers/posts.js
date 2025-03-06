const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
    try {
        const { title, question, status } = req.body;
        const userId = req.userId;

        if(!title || !question){
            return res.status(400).json({message: 'Title and Question are required'});
        }

        const newPost = await prisma.post.create({
            data: { title, question, status, userId }
        })

        return res.status(201).json({message: 'Post created', newPost});

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.draftAnswer = async (req, res) => {
    try {
        const { postId } = req.params;
        const { answer } = req.body;

        const post = await prisma.post.findUnique({
            where:{ id: Number(postId) }
        });

        if(!post){
            return res.status(400).json({message: 'Post does not exist'});
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(postId) },
            data: { answer }
        });

        return res.status(200).json({ message: 'Post status updated successfully', updatedPost });

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.changePostStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body;

        const post = await prisma.post.findUnique({
            where:{ id: Number(postId) }
        });

        if(!post){
            return res.status(400).json({message: 'Post does not exist'});
        }

        if(status === "published" && post.answer === ""){
            return res.status(400).json({ message: 'Post cannot be published without an answer' });
        }

        if(status != "published" && status != "unpublished") {
            return res.status(400).json({ message: 'Invalid post status. Use either "published" or "unpublished"' });
        }

        if(post.status == status) {
            return res.status(400).json({ message: 'Post status provided is the same as the current status of the post' });
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(postId) },
            data: { status }
        });

        return res.status(200).json({ message: 'Post status updated successfully', updatedPost });

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}