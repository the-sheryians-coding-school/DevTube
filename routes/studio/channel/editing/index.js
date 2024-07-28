const express = require("express")
const router = express.Router()

router.get('/', async (req, res) => res.render('studio', {
    page: 'customization'
}))


module.exports = router
