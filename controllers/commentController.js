const { formatNumber, getTimestamp } = require("@lib/utils")
const Channel = require("@models/Channel")
const Comment = require("@models/Comment")
const Video = require("@models/Video")


const createComment = async (req, res) => {
    try {
        const { text } = req.body
        const videoId = req.params.videoId
        const channelId = req.channel.id

        const [video, existingComment] = await Promise.all([
            Video.findById(videoId),
            Comment.findOne({ video: videoId, channel: channelId, text })
        ])

        if (!video || existingComment) return res.status(200).json({ comments: formatNumber(video.comments.length) })

        const newComment = new Comment({ video: videoId, channel: channelId, text })
        await newComment.save()

        video.comments.push(newComment._id)
        await video.save()

        res.status(201).json({ comments: formatNumber(video.comments.length), comment: [newComment] })
    } catch (error) {
        console.error('Error creating comment:', error)
        res.status(500).json({ error: 'Server error' })
    }
}


const updateCommentLikesDislikes = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
        if (!comment) return res.status(404).json({ error: 'Comment not found' })

        const { action } = req.query
        const channelId = req.channel.id

        // Ensure the channel exists
        const channelExists = await Channel.findById(channelId)
        if (!channelExists) {
            return res.status(400).json({ error: 'Invalid channel ID' })
        }

        // Prepare the update
        const update = {
            $pull: { [action === 'like' ? 'dislikes' : 'likes']: channelId },
            ...(action === 'like'
                ? { [comment.likes.includes(channelId) ? '$pull' : '$addToSet']: { likes: channelId } }
                : { [comment.dislikes.includes(channelId) ? '$pull' : '$addToSet']: { dislikes: channelId } })
        }

        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, update, { new: true })
        res.status(200).json({
            likes: updatedComment.likes.length
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: `Error updating comment: ${error.message}` })
    }
}

const replyToComment = async (req, res) => {
    try {
        const { id } = req.params
        const { video, text } = req.body

        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' })
        }

        // Verify if video and channel exist
        const videoExists = await Video.findById(video)
        const channelExists = await Channel.findById(req.channel.id)

        if (!videoExists || !channelExists) {
            return res.status(400).json({ error: 'Invalid video or channel ID' })
        }

        const newReply = new Comment({ video, channel: req.channel.id, text })
        await newReply.save()

        comment.replies.push(newReply._id)
        await comment.save()

        res.status(201).json(newReply)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params

        const comment = await Comment.findByIdAndDelete(id)
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' })
        }

        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getComments = async (req, res) => {
    try {
        const { videoId } = req.params
        const page = parseInt(req.query.page) || 1 // Default page 1
        const limit = parseInt(req.query.limit) || 10 // Default limit 10

        const skip = (page - 1) * limit

        const comments = await Comment.find({ video: videoId })
            .sort({ postedDate: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'channel',
                select: 'logoURL handle'
            })
            .populate({
                path: 'replies',
                populate: {
                    path: 'channel',
                    select: 'logoURL handle'
                }
            })

        res.json(comments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        res.status(500).json({ error: 'Server error' })
    }
}

module.exports = {
    createComment,
    updateCommentLikesDislikes,
    replyToComment,
    deleteComment,
    getComments
}
