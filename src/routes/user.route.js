const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();
const auth = require('../middlewares/auth');

router.post(
    "/create-user",
    UserController.CreateUser
);

router.post(
    "/login",
    UserController.loginUser
);

router.get(
    "/single-record",
    auth.verifyToken,
    UserController.findOneRec
);

router.get(
    "/list-user",
    auth.verifyToken,
    UserController.ListUser
);

router.get(
    "/active-user",
    auth.verifyToken,
    UserController.Activeuser
);

router.get(
    "/list-user/:id",
    auth.verifyToken,
    UserController.getUserById
);

router.delete(
    "/delete-user/:id",
    auth.verifyToken,
    UserController.deleteUser
);

router.put(
    "/update-user/:id",
    auth.verifyToken,
    UserController.updateUser
);

router.post(
    "/forgot-password",
    UserController.forgotPassword
);

router.post(
    "/verify-password",
    UserController.verifyOTPAndUpdatePassword
);

router.post(
    "/change-password/:id",
    UserController.changePassword
);

router.post(
    "/reset-password/:id",
    UserController.resetPassword
);

router.post(
    "/change-company",
    auth.verifyToken,
    UserController.changeCompany
);

module.exports = router;