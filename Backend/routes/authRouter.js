const express = require('express')
const passport = require('passport')
const {loginSuccess,logout} = require('../controllers/authController')
const authRouter = express.Router()


authRouter.get('/google',passport.authenticate('google',{scope:['profile','email']}))

authRouter.get("/google/callback",
    passport.authenticate("google", {
        successRedirect: "https://real-time-code-collaborator-two.vercel.app/logged",
        failureRedirect: "https://real-time-code-collaborator-two.vercel.app"
    })
);

authRouter.get("/login/success", loginSuccess);

// Logout
authRouter.get("/logout", logout);

module.exports = authRouter;