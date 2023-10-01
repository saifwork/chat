const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler( async(req,res,next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    console.log(authHeader);
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        console.log(token);
        console.log(process.env.ACCESS_TOKEN_SECRET);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            console.log("inside jwtVerify");
            if(err){
                console.log(err);
                console.log("inside if");
                res.status(401);
                throw new Error("User is not authorized");
            }
            console.log("outside if");
            console.log(decoded);
            req.user = decoded.user;
            next();
        });

        if(!token){
            res.status(401);
            throw new Error("User is not authorized or token is missing");
        }
    }
});

module.exports = validateToken;