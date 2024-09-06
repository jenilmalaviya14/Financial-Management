const express = require('express')
const Clientcontroller = require('../controllers/client.controller');
const auth = require('../middlewares/auth');
const router = express.Router();


router.post(
    "/client/create-client",
    auth.verifyToken,
    Clientcontroller.CreateClient
);

router.post(
    "/client/list-client",
    auth.verifyToken,
    Clientcontroller.ListClient
);

router.post(
    "/client/active-client",
    auth.verifyToken,
    Clientcontroller.ActiveClient
);

router.get(
    "/client/list-client/:id",
    auth.verifyToken,
    Clientcontroller.getClientById
);

router.delete(
    "/client/delete-client/:id",
    auth.verifyToken,
    Clientcontroller.deleteClient
);

router.put(
    "/client/update-client/:id",
    auth.verifyToken,
    Clientcontroller.updateClient
);
module.exports = router;