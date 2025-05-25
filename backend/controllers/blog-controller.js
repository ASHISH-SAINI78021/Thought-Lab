const blogService = require("../services/blog-service.js");

class BlogController {
    async addBlog(req , res){
        try {
            const data = req.body;
            const thumbnail = req.file?.filename;
            const blog = await blogService.addBlog(data , thumbnail);
            return res.json({
                success : true,
                blog
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            })
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