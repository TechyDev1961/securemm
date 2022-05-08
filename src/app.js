/* 
Rest Api for SecureMM
Authors: Shahzain, Andrew & Techy
*/
require('dotenv').config();
require("./strats/discord");
const express = require("express");
const passport = require("passport");
const cors = require("cors");
const app = express();
const routes = require("./routes");
const mongoose = require("mongoose");
const session = require("express-session");
const Store = require("connect-mongo")
//mongoose con
mongoose.connect("mongodb+srv://SecureMM:bfvCO4X0eVQhFZ11@securemm.noqbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
app.use(session({
    name: "securemm.sid",
    secret: "secret",
    store: Store.create({ mongoUrl: "mongodb+srv://SecureMM:bfvCO4X0eVQhFZ11@securemm.noqbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24
    }
}))

//auto updater
/*const config = {
    repository: 'https://github.com/Project-SecureMM/SecureMM-Site',
    fromReleases: true,
    tempLocation: 'techy add this (the location to save temporary files)',
    token: 'techy add this (your token of the github account to access the repo, see https://github.com/settings/tokens)',
    executeOnComplete: 'add the location of a .bat file in which you need npm start',
    exitOnComplete: true
}

const updater = new AutoGitUpdate(config);

updater.autoUpdate();*/

app.use( passport.initialize() );
app.use( passport.session() );
const PORT = process.env.PORT || 3001
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}))
app.use(express.json())
app.use("/api", routes)
app.all("*", ( req, res ) => {
    res.status(404).send({ message: "404 not found" })
})
app.listen(PORT, () => {
    console.log("Secure mm is up on: " + PORT)
})
