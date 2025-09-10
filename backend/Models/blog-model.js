const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['like', 'dislike'], 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const commentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const blogSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    tags: { 
        type: String 
    },
    thumbnail: { 
        type: String 
    },
    thumbnailPublicId: { 
        type: String 
    },
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    likes: { 
        type: Number, 
        default: 0 
    },
    dislikes: { 
        type: Number, 
        default: 0 
    },
    reactions: [reactionSchema],
    comments: [commentSchema]
});

module.exports = mongoose.model("Blog", blogSchema);