const passport = require("passport")
require('dotenv').config() // Load environment variables from .env file

const GoogleStrategy = require("passport-google-oauth20").Strategy
const Channel = require("@models/Channel") // Import the Channel model
const { createUniqueHandle } = require("@lib/utils")

// Configure the Google strategy for use by Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Google client ID from environment variable
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google client secret from environment variable
            callbackURL: "/api/auth/google/callback", // Callback URL after Google authentication
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                // Find a channel by email
                let channel = await Channel.findOne({ email: profile.emails[0].value })

                // If no channel is found, create a new one
                if (!channel) {

                    // Find handles with the same base name as the email username and if found make it unique
                    const handle = await createUniqueHandle(profile.emails[0].value.split('@')[0])
                    channel = await Channel.create({
                        name: profile.displayName, // Google profile display name
                        handle: handle,
                        email: profile.emails[0].value, // Google profile email
                        logoURL: profile.photos[0].value.split('=')[0], // Google profile photo URL
                    })
                }

                // Return the channel through the callback
                cb(null, channel)
            } catch (err) {
                // Handle errors
                cb(err)
            }
        }
    )
)

// Serialize the user to decide which data of the user object should be stored in the session
passport.serializeUser((channel, done) => {
    done(null, channel.id) // Store the channel id in the session
})

// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
    try {
        // Find the channel by ID
        const channel = await Channel.findById(id)
        done(null, channel) // Return the channel
    } catch (error) {
        done(error) // Handle errors
    }
})

module.exports = passport // Export the configured passport
