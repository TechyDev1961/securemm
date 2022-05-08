/* 
User authentication for SecureMM
Authors: Shahzain, Andrew
*/
const passport = require("passport");
const DiscordStartegy = require('passport-discord');
const { addMemberToGuild } = require("../wrap")
const user = require("../database/user")
passport.serializeUser((user, done) => {
    done(null, user.userId)
})

passport.deserializeUser(async (userId, done) => {
    try {
        const findUser = await user.findOne({ userId: userId })
        return findUser ? done(null, findUser) : done(null, null)
    } catch(e) {
        console.log(e);
        done(e, null)
    }
})

passport.use(
    new DiscordStartegy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.SECRET,
        callbackURL: process.env.CALLBACK,
        scope: ['identify', 'guilds', 'guilds.join']
    }, async (accessToken, refreshToken, profile, done) => {
        const {id, username, discriminator, avatar, guilds} = profile;
        const findUser = await user.findOneAndUpdate({ 
            userId: id
        }, {
            username: `${username}#${discriminator}`
        })
        if (findUser) {
            console.log("User was already in database")
            return done(null, findUser)
        } else {
            await addMemberToGuild(accessToken, id)
            const newUser = await user.create({
                userId: id,
                username: `${username}#${discriminator}`,
                weight: 1
            })
            return done(null, newUser)
        }
    })
)