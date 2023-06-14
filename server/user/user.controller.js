const User = require('./user.model');
const {createError} = require('http-errors');
const {createToken, verifyToken} = require('../util/jwt.js');

let cookieOptions = {
  secure: false,
  httpOnly: false,
  maxAge: 3600 * 24
}

/* -------------------------------------------------------------------------- */
/*                                   SIGNUP                                   */
/* -------------------------------------------------------------------------- */

const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body
  let { role } = req.body
  try {

    if (!role) {
      role = 'host';
    }

    if(password!=confirmPassword){
      res.status(400).json("Password and confirm password or not same");
      return next();
    }
    const newUser = await User.create({

      firstName,
      lastName,
      email,
      password

    })

    const token = await createToken({
      userid: newUser._id, userrole: newUser.role
    }, process.env.JWT_SECRET)

    if (process.NODE_ENV === "development") {
      cookieOptions.secure = true;
    }
    res.cookie("token", token, cookieOptions)

    newUser.password = undefined;

    res.status(201).json({
      message: "Signup successfully!",
      newUser
    })
    res.send();
  } catch (error) {
    next(error)
  }
}
/* -------------------------------------------------------------------------- */
/*                                   SIGNIN                                   */
/* -------------------------------------------------------------------------- */
const signin = async (req, res, next) => {
  console.log('signin controller')
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.authenticate(password))) {
      throw createError(401, "Wrong email or password!")
    }

    const token = await createToken({
      userid: user._id, userrole: user.role
    }, process.env.JWT_SECRET)

    if (process.NODE_ENV === "development") {
      cookieOptions.secure = true;
    }
    res.cookie("access_token", token, cookieOptions)



    user.password = undefined;

    res.status(200).json({
      message: "You logged in successfully!",
      user
    });
  } catch (error) {
    next(error)

  }
}

module.exports = { signup, signin };
