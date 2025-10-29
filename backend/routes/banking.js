// backend banking routes

const express = require("express");
const transactionRoutes = express.Router();
const dbo = require("../db/conn");

// deposit route
transactionRoutes.route("/deposit").post(async (req, res) => {
  try {
    // destructure req from front end
    const { accountNumber, accountName, amount } = req.body;

    // connect db and query for the user record
    let db = dbo.getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      accountNumber: accountNumber,
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "no user with such accountNumber found" });
    }

    // deposit amount into selected account
    //TODO
  } catch (error) {
    console.log("in route /depost catch error block");
    throw err;
  }
});
