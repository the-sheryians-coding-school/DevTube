const Channel = require("@models/Channel")
const Video = require("@models/Video")
const { io } = require("../app")
const express = require("express")
const { subscribeChannel, unsubscribeChannel, notificationsChannel } = require("@controllers/channelController")
const passport = require("passport")
const { default: axios } = require('axios')

const crypto = require('crypto')
const { createUniqueHandle } = require("@lib/utils")
const { getBunnyVideo, getShorts, getPublicVideos, getTagVideos } = require("@controllers/videoController")

const router = express.Router()

//check if handle is already registered
router.get('/checkHandle', async (req, res) => {
    if ((!!(await Channel.findOne({ handle: req.query.handle })) && req.query.handle !== req.channel?.handle))
        return res.json({ exists: true, suggestedHandel: await createUniqueHandle(req.query.handle) })
    res.json({ exists: false })
})

//update video status via bunny webhook
router.post('/updateStatus', async (req, res) => {

    const { VideoGuid, Status } = req.body

    const status = {
        0: "Queued",
        1: "Processing...",
        2: "Encoding...",
        3: "Finished",
        4: "Resolution Sampled",
        5: "Failed",
        6: "Uploading...",
        7: "UploadFinished",
        8: "UploadFailed",
        9: "CaptionsGenerated",
        10: "Title Or Description Generated"
    }

    const video = await Video.findOne({ videoId: VideoGuid })


    if (video) {
        video.status = status[Status]
        if (Status === 3) {
            const { length, width, height, category } = await getBunnyVideo(VideoGuid)
            console.log(length <= 60 && width >= height, length, width, height)
            Object.assign(video, {
                length,
                category,
                aspect: Math.min((height / width) * 100, 59),
                isShort: length <= 60 && width <= height
            })
        }
        await video.save()
        io.emit(VideoGuid, video.status)
    }

})

//subscribe to channel
router.get('/subscribe/:uid', subscribeChannel)

//unsubscribe a channel
router.get('/unsubscribe/:uid', unsubscribeChannel)


//notification mode 
router.get('/notification/:uid/:mode', notificationsChannel)

//get player from bunny by videoId & thumbnailName as query parameter
router.get('/getThumbnail', async (req, res) => {
    try {
        const { videoId, thumbnailName } = req.query
        if (!videoId || !thumbnailName) {
            return res.status(400).send('Missing videoId or thumbnailName')
        }

        const path = `/${videoId}/${thumbnailName}.jpg`

        const expires = Math.round(Date.now() / 1000) + 3600

        const base = process.env.BUNNY_TOKEN_KEY + path + expires

        const md5Hash = crypto.createHash('md5').update(base).digest('binary')

        let token = Buffer.from(md5Hash, 'binary').toString('base64')

        token = token.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')

        const imageUrl = `https://${process.env.BUNNY_CDN_HOSTNAME}${path}?token=${token}&expires=${expires}`

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        })
        res.set('Content-Type', 'image/jpeg')
        res.send(response.data)
    } catch (error) {
        console.error('Error:', error.message)
        res.status(500).send('Internal Server Error')
    }
})

//get player from bunny by video id
router.get('/player/:id', (req, res) => {
    const videoId = req.params.id

    const expiration = Math.floor(Date.now() / 1000) + 3600 // 3600 seconds = 1 hour

    const data = process.env.BUNNY_TOKEN_KEY + videoId + expiration

    const token = crypto.createHash('sha256').update(data).digest('hex')

    const secureUrl = `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}?token=${token}&expires=${expiration}`

    res.redirect(secureUrl)
})

//get shorts
router.get('/shorts', getShorts)

//get videos
router.get('/videos', getPublicVideos)
router.get('/hashtag/:tag/videos', getTagVideos)


//login with google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

//google login callback
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => res.redirect("/"))

//logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err)
            return res.status(500).send("Error logging out")
        }
        res.redirect('/')
    })
})

module.exports = router
