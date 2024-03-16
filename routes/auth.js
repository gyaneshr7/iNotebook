const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require('../middleware/fetchUser')

const JWT_SECRET = process.env.JWT_SECRET;

//ROUTE 1: Create a user using: POST '/api/auth/createuser'. No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists", success: false });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = {
        user: {
          id: user._id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken, success: true });
    } catch (error) {
      //catch errors
      console.error(error);
      res.status(500).json({error: "Some error occured", success: false});
    }
  }
);

// ROUTE2: Authenticate a user using POST '/api/auth/login', no login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user._id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken,success:true });
    } catch (error) {
      console.error(error);
      res.status(500).send("Some error occured");
    }
  }
);

// ROUTE3: Get logged in user details using POST '/api/auth/getuser', Login required
router.get('/getuser',fetchUser, async (req,res) => {
  try{
    const {id} = req.user
    const user = await User.findById(id).select('-password');
    res.json(user);
  }
  catch(error){
    console.error(error.message);
    res.status(500).send('Internal Server error')
  }
})

module.exports = router;
