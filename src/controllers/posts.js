const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.checkIfBookmarked = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        const isBookmarked = await prisma.bookmark.findFirst({
            where: {
                userId: parseInt(userId),
                postId: parseInt(postId),
            }
        });

        if(!isBookmarked){
            return res.status(200).json({ isBookmarked: false });
        }
        else{
            return res.status(200).json({ isBookmarked: true });
        }

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.userId;

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: parseInt(userId) },
            include: { post: true },
            orderBy: {
                createdAt: "desc"
            }
        });

        const posts = bookmarks.map(b => b.post);

        return res.status(200).json({ message: 'Bookmarks fetched', bookmarks: posts });

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.bookmarkPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        const postExists = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
        });

        if (!postExists || postExists.status == "unpublished") {
            return res.status(400).json({message: 'Post does not exist'});
        }

        const existing = await prisma.bookmark.findFirst({
            where: {
                userId: parseInt(userId),
                postId: parseInt(postId),
            },
        });

        if (existing){
            return res.status(400).json({message: 'Post already bookmarked'});
        }

        const bookmark = await prisma.bookmark.create({
            data: {
              user: { connect: { id: userId } },
              post: { connect: { id: parseInt(postId) } }
            }
        });
        
        return res.status(200).json({message: 'Post successfully bookmarked', post: postId, user: userId});

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.unbookmarkPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        const postExists = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!postExists) {
            return res.status(400).json({message: 'Post does not exist'});
        }

        const existing = await prisma.bookmark.findFirst({
            where: {
                userId: parseInt(userId),
                postId: parseInt(postId),
            }
        });

        if(!existing){
            return res.status(400).json({message: 'Post already bookmarked'});
        }

        const deleteBookmark= await prisma.bookmark.delete({
            where: {
              id: existing.id,
            },
          })
        
        return res.status(200).json({message: 'Bookmark removed'});

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.getPostByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await prisma.post.findUnique({
            where: { id: Number(postId) }
        });

        if(!post){
            return res.status(400).json({message: "Post does not exist"});
        }

        if(post.status === "unpublished"){
            return res.status(400).json({message: "Post is not published yet"});
        }

        return res.status(200).json({message: "Post found", post: post});

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.getPublishedPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: "published" },
            orderBy: {
                publishedAt: "desc"
            }
        });
        
        if(posts.length == 0){
            return res.status(200).json({message: "No published posts yet", posts: []});
        }

        return res.status(200).json({message: "Published posts found", posts: posts});

    } catch (error) {
        return res.status(500).json({message: "Something went wrong", error: error.message});
    }
}

exports.getUnpublishedPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: "unpublished" },
            orderBy: {
                createdAt: "desc"
            }
        });
        
        if(posts.length == 0){
            return res.status(200).json({message: "No pending posts"});
        }

        return res.status(200).json({message: "Unpublished posts found", posts: posts});

    } catch (error) {
        return res.status(500).json({message: "Something went wrong", error: error.message});
    }
}

exports.getPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await prisma.post.findMany({
            where: { userId: Number(userId) }
        });

        if(posts.length == 0){
            return res.status(200).json({message: "User does not have posts"});
        }

        return res.status(200).json({message: "User's posts found", posts: posts});

    } catch (error) {
        return res.status(500).json({message: "Something went wrong", error: error.message});
    }
}

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
            data: { 
                status,
                publishedAt: new Date().toISOString()
             }
        });

        return res.status(200).json({ message: 'Post status updated successfully', post: updatedPost });

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }
}

exports.getUnpublishedPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await prisma.post.findUnique({
            where:{ id: Number(postId) },
        });

        if(!post){
            return res.status(400).json({message: 'Post does not exist'});
        }

        return res.status(200).json({ message: 'Unpublished post found', post: post });


    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error: error.message});
    }

}