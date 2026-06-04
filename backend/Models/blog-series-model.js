const mongoose = require("mongoose");

const blogSeriesSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String 
    },
    thumbnail: { 
        type: String 
    },
    thumbnailPublicId: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("BlogSeries", blogSeriesSchema);
