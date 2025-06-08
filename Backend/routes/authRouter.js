const express = require('express')
const passport = require('passport')
const {loginSuccess,logout} = require('../controllers/authController')
const authRouter = express.Router()


authRouter.get('/google',passport.authenticate('google',{scope:['profile','email']}))

authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/logged`);
    }
);

authRouter.get("/login/success", loginSuccess);

// Logout
authRouter.get("/logout", logout);

module.exports = authRouter;