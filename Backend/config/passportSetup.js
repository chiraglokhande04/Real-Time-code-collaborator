const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
require('dotenv').config();
const User = require('../models/User');

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

passport.use( new GoogleStrategy(
    {clientID,clientSecret,callbackURL,scope:['profile','email']},
    async(request,accessToken,refreshToken,profile,done)=>{
        console.log("Google Profile Data:", profile); 
        try{
            let user = await User.findOne({googleId:profile.id});

            if (!user){
                user = await User.create({
                    googleId:profile.id,
                    displayName:profile.displayName,
                    email:profile.emails[0].value,
                    image:profile.picture
                })
                await user.save()
            }

            return done(null,user);

        }catch(err){
            console.log(err);
            return done(err,null);
        }
    }
       
))

passport.serializeUser((user,done)=>{
  done(null,user.id)
})

passport.deserializeUser(async(id,done)=>{
    try{
        let user = await User.findById(id)
        done(null,user)
    }catch(err){
        done(err,null)
    }
    
})