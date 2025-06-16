const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const {loginSuccess,logout} = require('../controllers/authController')
const authRouter = express.Router()


authRouter.get('/google',passport.authenticate('google',{scope:['profile','email']}))

authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
    (req, res) => {

        const token = jwt.sign({_id:req.user._id,username:req.user.username}, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });

        res.redirect(`${process.env.CLIENT_URL}/logged`);
    }
);

authR

authRouter.get("/login/success", loginSuccess);

// Logout
authRouter.get("/logout", logout);

module.exports = authRouter;