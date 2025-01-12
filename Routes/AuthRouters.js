const { signup } = require('../controller/AuthController');
const { signupValidation } = require('../Middlewares/AuthValidation');

const { login } = require('../controller/AuthController');
const { loginValidation } = require('../Middlewares/AuthValidation');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);

module.exports = router;
