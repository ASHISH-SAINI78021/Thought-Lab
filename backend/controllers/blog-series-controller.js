const BlogSeries = require("../Models/blog-series-model");
const Blog = require("../Models/blog-model");

class BlogSeriesController {
    
    // Create new Blog Series
    async createSeries(req, res) {
        try {
            const { title, description } = req.body;
            let thumbnail = "";
            let thumbnailPublicId = "";
            
            // Assume single file upload via some middleware (similar to blogs)
            // Or maybe they just pass URLs? In existing blog creation they probably use a service.
            // But if there's an image passed in req.file, we'll need to parse it later. 
            // For now, let's just make it simple.
            
            const existingSeries = await BlogSeries.findOne({ title });
            if (existingSeries) {
                return res.status(400).json({ message: "Series with this title already exists" });
            }

            const newSeries = await BlogSeries.create({
                title,
                description,
                thumbnail,
                thumbnailPublicId
            });

            res.status(201).json({ success: true, series: newSeries });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    // Get all series
    async getAllSeries(req, res) {
        try {
            const tempSearch = req.query.search || "";
            const series = await BlogSeries.find({
                title: { $regex: tempSearch, $options: 'i' }
            }).sort({ createdAt: -1 });

            res.status(200).json({ success: true, count: series.length, data: series });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    // Get series by ID including all associated blogs
    async getSeriesById(req, res) {
        try {
            const { id } = req.params;
            const series = await BlogSeries.findById(id);
            if (!series) {
                return res.status(404).json({ message: "Blog series not found" });
            }

            // Fetch the blogs linked to this series
            const blogs = await Blog.find({ series: id })
                .select('_id title thumbnail tags createdAt chapterNumber likes comments reactions') // don't return full content
                .sort({ chapterNumber: 1 });

            res.status(200).json({ success: true, series, blogs });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
    
    // Update Series
    async updateSeries(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const series = await BlogSeries.findByIdAndUpdate(id, updates, { new: true });
            
            if (!series) return res.status(404).json({ message: "Series not found" });
            
            res.status(200).json({ success: true, series });
            
        } catch (error) {
             res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

    // Delete Series
    async deleteSeries(req, res) {
        try {
            const { id } = req.params;
            const series = await BlogSeries.findByIdAndDelete(id);
            if (!series) return res.status(404).json({ message: "Series not found" });
            
            // Optionally, we could remove the series reference from blogs.
            await Blog.updateMany({ series: id }, { $set: { series: null, chapterNumber: null } });

            res.status(200).json({ success: true, message: "Series deleted successfully" });
        } catch (error) {
             res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

module.exports = new BlogSeriesController();
