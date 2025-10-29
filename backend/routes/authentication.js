// backend auth routes

const express = require("express");
const userRoutes = express.Router();
const dbo = require("../db/conn");
const crypto = require("crypto");
const { error } = require("console");

// function to hash and return resulting salted password using sha256
function sha256(pAndS) {
  return crypto.createHash("sha256").update(pAndS).digest("hex");
}

//  REGISTER
userRoutes.route("/register").post(async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "empty fields" });
    }

    let db = dbo.getDB();
    const usersCollection = db.collection("users");

    const existing = await usersCollection.findOne({ username: username });
    if (existing) {
      return res.status(400).json({ error: "user already exists" });
    }

    // obtain salt and hash the password
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = sha256(password + salt);

    // insert new user record with default fields
    await usersCollection.insertOne({
      username: username,
      salt: salt,
      password: hashedPassword,
      accounts: [
        { name: "savings", balance: 0 },
        { name: "checking", balance: 0 },
        { name: "other", balance: 0 },
      ],
    });

    // set session username
    req.session.username = username;
    let status = "session set";

    // send back some json
    const resultObj = {
      message: "user is registered and logged in",
      username: username,
      status: status,
    };
    res.json(resultObj);
  } catch (err) {
    throw err;
  }
});

// LOGIN
userRoutes.route("/login").post(async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "cannot have empty fields" });
    }

    let db = dbo.getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ username: username });

    // verify user exists
    if (!user) {
      return res.status(400).json({ error: "no such user with this username" });
    }

    // if user found, apply salt to stored password and check for match
    const salt = user.salt;
    const hashedPassword = user.password;
    const match = sha256(password + salt);

    if (match != hashedPassword) {
      return res.status(400).json({ error: "invalid password" });
    }

    // check if session already going, if not start new session
    let status = "";
    if (req.session.username) {
      status = "user session already created";
    } else {
      req.session.username = username;
      req.session.type = user.type;
      status = "session created";
    }

    // send back json
    const resultObj = {
      message: "user logged in",
      username: username,
      status: status,
    };

    res.json(resultObj);
  } catch (err) {
    throw err;
  }
});

// LOGOUT
userRoutes.route("/logout").post((req, res) => {
  // destroy session and clear cookies
  if (req.session.username) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ err: "session unable to be destroyed" });
      } else {
        res.clearCookie("connect.sid");
        return res.json({ message: "successfully logged out" });
      }
    });
  } else {
    return res.status(400).json({ error: "no session found to logout of" });
  }
});

// VERIFY SESSION - used to see if a session is created to prevent navigation to restricted pages
userRoutes.route("/verify").get(async function (req, res) {
  // see if there is one
  let status = "";
  if (!req.session.username) {
    status = "no session set";
  } else {
    status = "valid session";
  }

  // send data back
  const resultObj = {
    status: status,
    username: req.session.username,
  };

  res.json(resultObj);
});

module.exports = userRoutes;
