const express = require('express')
const Clientcontroller = require('../controllers/client.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/create-client",
    auth.verifyToken,
    Clientcontroller.CreateClient
);

router.post(
    "/list-client",
    auth.verifyToken,
    Clientcontroller.ListClient
);

router.post(
    "/active-client",
    auth.verifyToken,
    Clientcontroller.ActiveClient
);

router.get(
    "/list-client/:id",
    auth.verifyToken,
    Clientcontroller.getClientById
);

router.delete(
    "/delete-client/:id",
    auth.verifyToken,
    Clientcontroller.deleteClient
);

router.put(
    "/update-client/:id",
    auth.verifyToken,
    Clientcontroller.updateClient
);
module.exports = router;