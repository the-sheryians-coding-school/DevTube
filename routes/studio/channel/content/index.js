const express = require("express")
const router = express.Router()


const { getVideos } = require("@controllers/videoController")

const videos = require('./videos')
const shorts = require('./shorts')
const live = require('./live')
const playlists = require('./playlists')


router.get('/*', async (req, res) => {

    const criteria = {
        channel: req.channel._id,
        page: 1,
        limit: 10
    }

    const videos = await getVideos(criteria)

    res.render('studio', {
        page: 'content', videos
    })
})

// router.use("/videos", videos)
// router.use("/shorts", shorts)
// router.use("/live", live)
// router.use("/playlists", playlists)

// router.use(async (req, res, next) => {
//     res.locals.page = 'content'
//     next()
// })

module.exports = router
