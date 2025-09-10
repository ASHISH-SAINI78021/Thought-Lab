const blogService = require("../services/blog-service.js");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (if not already configured elsewhere)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUD_SECRET
});

class BlogController {
    async addBlog(req, res) {
        try {
            // If no file was uploaded, return error
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Thumbnail image is required"
                });
            }

            // Create blog with Cloudinary URL from multer-storage-cloudinary
            const blogData = {
                title: req.body.title,
                content: req.body.content,
                tags: req.body.tags,
                thumbnail: req.file.path,
                thumbnailPublicId: req.file.filename // Cloudinary public_id
            };

            const blog = await blogService.addBlog(blogData);
            if (!blog){
                console.log("Blog not created");
                return res.status(400).json({
                    success: false,
                    message: "Blog not created"
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Blog created successfully',
                blog,
                thumbnailUrl: req.file.path
            });

        } catch (error) {
            console.error('Blog creation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create blog',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async blog(req, res) {
        try {
            const id = req.params.id;
            if (!id){
                return res.status(400).json({
                    success: false,
                    message: "ID is required"
                });
            }
            
            const blog = await blogService.blog(id);
            if (!blog){
                return res.status(404).json({
                    success: false,
                    message: "Blog doesn't exist"
                });
            }

            // Check if user has reacted (if authenticated)
            let userReaction = null;
            if (req.user && req.user.id) {
                userReaction = blog.reactions.find(
                    reaction => reaction.userId.toString() === req.user.id
                );
                userReaction = userReaction ? userReaction.type : null;
            }

            return res.json({
                success: true,
                blog,
                userReaction
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async allBlogs(req, res) {
        try {
            const blogs = await blogService.allBlogs();
            if (!blogs || blogs.length === 0){
                return res.json({
                    success: false,
                    message: "No blogs found"
                });
            }
            
            return res.json({
                success: true,
                blogs,
                count: blogs.length
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async reactToBlog(req, res) {
        try {
            const id = req.params.id;
            const { type } = req.body; // 'like' or 'dislike'
            const userId = req.user.id; // From authentication middleware
            
            if (!type || !['like', 'dislike'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid reaction type (like/dislike) is required"
                });
            }
            
            const result = await blogService.reactToBlog(id, userId, type);
            
            return res.json({
                success: true,
                likes: result.likes,
                dislikes: result.dislikes,
                userReaction: result.userReaction
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getReactions(req, res) {
        try {
            const id = req.params.id;
            
            const reactions = await blogService.getReactions(id);
            
            return res.json({
                success: true,
                likes: reactions.likes,
                dislikes: reactions.dislikes
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async comment(req, res) {
        try {
            const blogId = req.params.blogId;
            const { content } = req.body;
            const userId = req.user.id; // From authentication middleware
            
            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: "Comment content is required"
                });
            }
            
            const comment = await blogService.comment(blogId, userId, content);
            
            return res.json({
                success: true,
                comment
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateBlog(req, res) {
        try {
            const blogId = req.params.id;
            let updateData = { ...req.body };
            
            // If a new thumbnail is uploaded
            if (req.file) {
                // First, get the current blog to find the existing thumbnail public_id
                const currentBlog = await blogService.blog(blogId);
                
                // Delete the old thumbnail from Cloudinary if exists
                if (currentBlog && currentBlog.thumbnailPublicId) {
                    try {
                        await cloudinary.uploader.destroy(currentBlog.thumbnailPublicId);
                    } catch (deleteError) {
                        console.warn('Could not delete old thumbnail:', deleteError.message);
                    }
                }
                
                // Use the new uploaded file info from multer-storage-cloudinary
                updateData.thumbnail = req.file.path;
                updateData.thumbnailPublicId = req.file.filename;
            }
            
            const updatedBlog = await blogService.updateBlog(blogId, updateData);
            
            if (!updatedBlog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found or not updated"
                });
            }
            
            return res.json({
                success: true,
                blog: updatedBlog
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteBlog(req, res) {
        try {
            const blogId = req.params.id;
            
            // Get the blog to find the thumbnail public_id
            const blog = await blogService.blog(blogId);
            
            if (blog && blog.thumbnailPublicId) {
                try {
                    // Delete the thumbnail from Cloudinary
                    await cloudinary.uploader.destroy(blog.thumbnailPublicId);
                } catch (deleteError) {
                    console.warn('Could not delete thumbnail from Cloudinary:', deleteError.message);
                }
            }
            
            // Delete the blog from database
            const deletedBlog = await blogService.deleteBlog(blogId);
            
            if (!deletedBlog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            }
            
            return res.json({
                success: true,
                message: "Blog deleted successfully"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new BlogController();