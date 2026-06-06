import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect private routes
// Looks for the token in the header and verifies it
export const protect = async (req, res, next) => {

    try {
        let token;

        // Check if the request has an Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
        }
        
        // No token sent
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user from token id, without password
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Continue to controller
        next();

    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};