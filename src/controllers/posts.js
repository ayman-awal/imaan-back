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

// exports.getUserPosts = async (req, res) => {
//     try {
//         const { userId } = req.userId;

//         const userPosts = await prisma.post.findMany({
//             where:{ userId }
//         });

//         // if(userPosts){
//         return res.status(200).json({message: 'Post created', userPosts});
//         // }

//     } catch (error) {
//         return res.status(500).json({message: 'Something went wrong', error: error.message});
//     }
// }