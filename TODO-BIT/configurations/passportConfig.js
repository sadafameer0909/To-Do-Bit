const JwtStrategy = require('passport-jwt').Strategy;
const  ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport')
const mongoose = require("mongoose");
const {User}=require('../models/User')
require('dotenv').config();


const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey =process.env.SECRET_KEY;


passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
        console.log("JWT PAYLOAD", jwt_payload);
        console.log("ID JWT", jwt_payload.id);
        
        const user = await User.findOne({ _id: jwt_payload.id });
        console.log("findOne success:", user);
        
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        console.error("Error finding user:", error);
        return done(error, false);
    }

}));
