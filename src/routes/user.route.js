const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();
const auth = require('../middlewares/auth');

router.post(
    "/user/login",
    UserController.loginUser
);

router.post(
    "/user/create-user",
    UserController.CreateUser
);


router.get(
    "/user/single-record",
    auth.verifyToken,
    UserController.findOneRec
);

router.get(
    "/user/list-user",
    auth.verifyToken,
    UserController.ListUser
);

router.get(
    "/user/active-user",
    auth.verifyToken,
    UserController.Activeuser
);

router.get(
    "/user/list-user/:id",
    auth.verifyToken,
    UserController.getUserById
);

router.delete(
    "/user/delete-user/:id",
    auth.verifyToken,
    UserController.deleteUser
);

router.put(
    "/user/update-user/:id",
    auth.verifyToken,
    UserController.updateUser
);

router.post(
    "/user/forgot-password",
    UserController.forgotPassword
);

router.post(
    "/user/verify-password",
    UserController.verifyOTPAndUpdatePassword
);

router.post(
    "/user/change-password/:id",
    auth.verifyToken,
    UserController.changePassword
);

router.post(
    "/user/reset-password/:id",
    auth.verifyToken,
    UserController.resetPassword
);

router.post(
    "/user/change-company",
    auth.verifyToken,
    UserController.changeCompany
);

module.exports = router;