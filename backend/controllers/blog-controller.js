const blogService = require("../services/blog-service.js");
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

class BlogController {
    async addBlog(req, res) {
        try {
            // console.log("Request received with file:", req.file); // Debug log

            // 2. Verify Cloudinary upload was successful
            if (!req.file || !req.file.path) {
                return res.status(400).json({
                    success: false,
                    message: "Image upload failed - no Cloudinary URL returned"
                });
            }
    
            // 3. Create blog with existing Cloudinary URL
            const blogData = {
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                thumbnail: req.file.path // Using the already uploaded URL
            };
    
            const blog = await blogService.addBlog(blogData);
    
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

    async blog(req ,res){
        try {
            const id = req.params.id;
            console.log(id);
            if (!id){
                return res.json({
                    success : false,
                    message : "Id should be present"
                });
            }
            const blog = await blogService.blog(id);
            if (!blog){
                return res.json({
                    success : false,
                    message : "Blod doesn't exist"
                });
            }

            return res.json({
                success : true,
                blog
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    }

    async allBlogs(req , res){
        try {
    
            const blogs = await blogService.allBlogs();
            if (!blogs){
                console.log("NO blogs...");
                return res.json({
                    success : false,
                    message : "No blogs..."
                });
            }
            
            return res.json({
                success : true,
                blogs
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    }

    async likeBlog(req , res){
        try {
            const id = req.params.id;
            const userId = req.body;
            const blog = await blogService.likeBlog(id , userId);
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    }

    async comment(req , res){
        try {
            const blogId = req.params.blogId;
            const comment = await blogService.comment(blogId);
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
        
    }

    async updateBlog(req , res){
        try {
            const blogId = req.params.id;
            const upadatedBlog = await blogService.updateBlog(id , value);

            if (upadatedBlog){
                return res.json({
                    success : false,
                    message : "Message not updated"
                });
            }
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            })
        }
    }
}


module.exports = new BlogController();