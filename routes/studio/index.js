const express = require("express")
const router = express.Router()
const channel = require('./channel')
const { getStudioVideos, getStudioShorts } = require("@controllers/videoController")

//Stdio page redirect
router.get('/', async (req, res) => res.redirect('/studio/channel/' + req.channel.uid))


//api
router.get('/videos', getStudioVideos)
router.get('/shorts', getStudioShorts)

//Forwarded routes
router.use("/channel/:uid", channel)
router.use("/channel", channel)

module.exports = router
