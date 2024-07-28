const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema({
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    text: { type: String, trim: true, required: true },
    postedDate: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment