const express = require("express")
const router = express.Router()

const comments = require('./comments')
const analytics = require('./analytics')
const editing = require('./editing')
const content = require('./content')


//dashboard 
router.get('/', async (req, res) => res.render('studio', { page: 'dashboard' }))

//Forwarded routes
router.use("/content", content)
router.use("/analytics", analytics)
router.use("/comments", comments)
router.use("/editing", editing)

module.exports = router
