const Blog = require("../Models/blog-model");

class BlogService {
    async addBlog(data , thumbnail){
        const {title , content , tags} = data;
        // console.log("title : " , title);
        // console.log("content : " , content);
        // console.log("tags : " , tags);
        // console.log("thumbnail : " , thumbnail);

        if (!title || !content || !tags){
            return ;
        }

        const NewBlog = new Blog({
            title : title,
            content : content,
            tags : tags,
            thumbnail: `/storage/${thumbnail}`
        });
        await NewBlog.save();
        return NewBlog;
    }

    async allBlogs(){
        const blogs = await Blog.find().sort({ createdAt: -1 });
        return blogs;
    }

    async likeBlog(id , userId){
        if (!id){
            return {
                success : false,
                message : "Id is required"
            };
        }
        if (!userId){
            return {
                success : false,
                message : "UserId is required"
            };
        }

        const blog = await Blog.findById(id);

        if (!blog.likes.includes(userId)){
            blog.likes.push(userId);
        }
        else {
            blog.likes = blog.likes.filter((id) => id !== userId)
        }

        await blog.save();

        return {
            success : true,
            likes : blog.likes.length
        };
    }

    async comment(blogId){
        if (!blogId){
            return {
                success : false,
                message :  "BlogId is required"
            };
        }

        const comment = await Blog.find({blogId : blogId});
        
        if (!comment){
            return {
                success : false,
                message : "Comment doesn't exist"
            };
        }

        return {
            success : true,
            comment
        };
    }

    async blog(id){
        if (!id){
            return ;
        }

        const blog = await Blog.findById(id);
        return blog;
    }
}

module.exports = new BlogService();