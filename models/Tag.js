const mongoose = require('mongoose')
const { Schema } = mongoose

const tagSchema = new Schema({
    name: { type: String, trim: true, required: true, unique: true },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
})

const Tag = mongoose.model("Tag", tagSchema)

module.exports = Tag 
