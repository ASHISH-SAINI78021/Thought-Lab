// In your blog-service.js
const Blog = require("../Models/blog-model.js");

class BlogService {
    async addBlog(blogData) {
        try {
            const blog = new Blog(blogData);
            return await blog.save();
        } catch (error) {
            throw error;
        }
    }

    async blog(id) {
        try {
            return await Blog.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async allBlogs() {
        try {
            return await Blog.find().sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }

    async reactToBlog(blogId, userId, type) {
        try {
            const blog = await Blog.findById(blogId);
            
            if (!blog) {
                throw new Error('Blog not found');
            }
            
            // Check if user already reacted
            const existingReactionIndex = blog.reactions.findIndex(
                reaction => reaction.userId.toString() === userId
            );
            
            if (existingReactionIndex !== -1) {
                const existingReaction = blog.reactions[existingReactionIndex];
                
                // If clicking the same reaction again, remove it
                if (existingReaction.type === type) {
                    blog.reactions.splice(existingReactionIndex, 1);
                    if (type === 'like') blog.likes -= 1;
                    if (type === 'dislike') blog.dislikes -= 1;
                } else {
                    // If changing reaction type
                    if (existingReaction.type === 'like') blog.likes -= 1;
                    if (existingReaction.type === 'dislike') blog.dislikes -= 1;
                    
                    blog.reactions[existingReactionIndex].type = type;
                    
                    if (type === 'like') blog.likes += 1;
                    if (type === 'dislike') blog.dislikes += 1;
                }
            } else {
                // Add new reaction
                blog.reactions.push({
                    userId: userId,
                    type: type
                });
                
                if (type === 'like') blog.likes += 1;
                if (type === 'dislike') blog.dislikes += 1;
            }
            
            await blog.save();
            
            return {
                likes: blog.likes,
                dislikes: blog.dislikes,
                userReaction: type
            };
        } catch (error) {
            throw error;
        }
    }

    async getReactions(blogId) {
        try {
            const blog = await Blog.findById(blogId).populate('reactions.userId', 'username name');
            
            if (!blog) {
                throw new Error('Blog not found');
            }
            
            const likes = blog.reactions
                .filter(reaction => reaction.type === 'like')
                .map(reaction => reaction.userId);
            
            const dislikes = blog.reactions
                .filter(reaction => reaction.type === 'dislike')
                .map(reaction => reaction.userId);
            
            return { likes, dislikes };
        } catch (error) {
            throw error;
        }
    }

    async comment(blogId, userId, content) {
        try {
            const blog = await Blog.findById(blogId);
            
            if (!blog) {
                throw new Error('Blog not found');
            }
            
            blog.comments.push({
                userId: userId,
                content: content,
                createdAt: new Date()
            });
            
            await blog.save();
            
            // Return the last comment (the one just added)
            return blog.comments[blog.comments.length - 1];
        } catch (error) {
            throw error;
        }
    }

    async updateBlog(blogId, updateData) {
        try {
            return await Blog.findByIdAndUpdate(
                blogId, 
                updateData, 
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteBlog(blogId) {
        try {
            return await Blog.findByIdAndDelete(blogId);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BlogService();