const express = require("express");
const authController = require("../controllers/user_auth");
const router = express.Router();
router.get('/',authController.isLoggedIn, (req, res) => {
    res.sendFile("main.html", { root: './public/shared' })
});
router.get('/register', (req, res) => {
    res.sendFile("register.html", { root: './public/shared' })
});
router.get('/login', (req, res) => {
    res.sendFile("login.html", { root: './public/shared' })
});
router.get('/profile', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.sendFile("profile.html", { root: './public/shared' })
    } else {
        res.sendFile("login.html", { root: './public/shared' });
    }
})
router.get('/home', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.sendFile("home.html", { root: './public/shared' })
    } else {
        res.sendFile("login.html", { root: './public/shared' });
    }
})
router.get('/session:session_ID', (req,res) =>{  //get list of item by sessionID
    res.sendFile("items.html", {root: './public/shared'});
})
router.get('/view_item:item_ID',(req,res) =>{
    res.sendFile("view_item.html", {root: './public/shared'});
})
router.get('/bid_item:item_ID', (req,res) => {
    res.sendFile("bid_item.html", {root: './public/bidder'});
})
router.get('/add_session',(req,res) => {
    res.sendFile("add_session.html",{root: './public/admin'});
})
router.get('/add_item',(req,res) => {
    res.sendFile("add_item.html",{root: './public/seller'});
})
module.exports = router;