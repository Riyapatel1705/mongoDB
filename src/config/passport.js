import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../db/models/User.js";
import dotenv from "dotenv";

dotenv.config();


//implement google strategy for authentication
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALL_BACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                console.log("Email received from google:",email);

                // Check if the user exists in the database
                const user = await User.findOne({ where: { email } });

                if (!user) {
                    return done(null, false, { message: "Access Denied: Email not registered." });
                }

                // If user exists, allow login
                return done(null, user);
            } catch (error) {
                console.log("Error in google authentication:",error);
                return done(error, null);
            }
        }
    )
);

//serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;