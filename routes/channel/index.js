const express = require("express")
const router = express.Router()

const videos = require('./videos')
const { createChannel, getChannelAndSubscription, updateChannel } = require("@controllers/channelController")
const multer = require("multer")
const { isloggedIn } = require("@lib/middlewares")
const Tag = require("@models/Tag")


//route for getting channel by id for e.g. /channel/UCV1eUw1RkJXVEdXd0YvUUdD
router.get(/^\/(UC\w+)?$/, async (req, res) => {
    if (!req.params[0]) return res.redirect('/channel/create')
    getChannelAndSubscription(req, res, false)
})
router.get(/^\/(UC\w+)?\/videos$/, async (req, res) => {
    if (!req.params[0]) return res.redirect('/channel/create')
    getChannelAndSubscription(req, res, false)
})
router.get(/^\/(UC\w+)?\/shorts$/, async (req, res) => {
    if (!req.params[0]) return res.redirect('/channel/create')
    getChannelAndSubscription(req, res, false)
})

//create channel page render
router.get("/create", isloggedIn, (req, res) => req.channel.uid ? res.redirect("/channel/" + req.channel.uid) : res.render("devtube", {
    page: 'home',
    isCreateChannel: true
}))

//create channel backend
router.post("/create", isloggedIn, multer().single('image'), createChannel)

//create channel backend
router.post("/edit", isloggedIn, multer().fields([{ name: 'logo' }, { name: 'banner' }]), updateChannel)

//Forwarded routes
router.use("/videos", videos)

module.exports = router
