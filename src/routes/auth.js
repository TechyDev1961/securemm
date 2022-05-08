const router = require("express").Router()
const passport = require('passport')
// Simple router for our auth
router.get("/discord", passport.authenticate("discord"))

router.get("/discord/redirect", passport.authenticate("discord"), ( req, res ) => {
    res.redirect("http://localhost:3000/requestmm")
})
router.get("/logout", async ( req, res ) => {
    if (req.user) {
        req.logOut()
        res.status(200).send({ message: "OK"})
    } else {
        res.status(401).send({ message: "Unauthorized" })
    }
})
router.get("/", ( req, res ) => {
    if (req.user) {
        res.status(200).send({ user: req.user })
    } else {
        res.status(401).send({ message: "Unauthorized"})
    }
})
module.exports = router