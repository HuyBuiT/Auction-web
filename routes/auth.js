const express = require("express");
const userController = require("../controllers/user_auth.js");
const sessionController = require("../controllers/session_auth.js");
const itemController = require("../controllers/item_auth.js");
const router = express.Router();

//user
router.post('/register', userController.register)
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/data', userController.isLoggedIn, (req, res) => {
    res.json(req.user);
});

// session
router.get('/all_sessions', sessionController.getAllSessions);
router.get('/session_by_name',sessionController.getSessionsByName);
router.post('/delete_session_by_name',userController.isLoggedIn, sessionController.deleteSessionByName);
router.post('/add_session',userController.isLoggedIn, sessionController.addNewSession);
router.post('/update_session',userController.isLoggedIn, sessionController.updateSessionById);

//item
router.post('/add_item',userController.isLoggedIn, itemController.addNewItem);
router.post('/update_item',userController.isLoggedIn, itemController.updateItemById);
router.get('/all_items',itemController.getAllItems);
router.get('/item_by_ID/:item_ID', itemController.getItemsByID);
router.get('/item_by_session/:session_ID', itemController.getAllItemsBySession);
router.post('/delete_item',userController.isLoggedIn, itemController.deleteItemById);
module.exports = router;