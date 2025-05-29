import passport from "passport";
import jwt from 'jsonwebtoken';


//add google authentication 
export const authenticateUser = passport.authenticate("google", { scope: ["profile", "email"] });

//add authentication callback
export const authenticateCallback = (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });

        if (!user) {
            // If user is not found -> Redirect to frontend login failed page
            return res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Redirect to frontend with token in query params
        res.redirect(`${process.env.FRONTEND_URL}/auth/dashboard?token=${token}`);
    })(req, res, next);
};



//success message after successful authentication
export const googleAuthSuccess = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    res.json({ message: "Google authentication successful", user: req.user });
};