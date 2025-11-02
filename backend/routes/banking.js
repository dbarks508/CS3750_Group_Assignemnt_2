// backend banking routes

const express = require("express");
const transactionRoutes = express.Router();
const dbo = require("../db/conn");

// deposit route
transactionRoutes.route("/deposit").post(async (req, res) => {
  console.log("in backend route /deposit");
  try {
    // destructure req from front end
    const { catagory, accountNumber, accountIndex, amount } = req.body;

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
    const identifier = { accountNumber: accountNumber };
    const updatePath = `accounts.${accountIndex - 1}.balance`;
    const updatedAmount = { $inc: { [updatePath]: amount } };
    let result = await usersCollection.updateOne(identifier, updatedAmount);

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      console.log("deposit error");
    }

    const transactionCollection = db.collection("transactions");

    const transactionObject = {
      accountNumber: accountNumber,
      accountIndex: accountIndex,
      action: "deposit",
      amount: amount,
      catagory: catagory,
      date: new Date(),
    };

    result = await transactionCollection.insertOne(transactionObject);

    if (!result.acknowledged) {
      console.log("transaction not added to history");
    } else {
      const updatedUser = await transactionCollection.findOne({
        accountNumber: accountNumber,
      });
      // send back something?
      res.json({
        status: "deposit successful",
        account: user.accountIndex,
        updatedAmount: updatedUser.accounts[accountIndex - 1].balance,
      });
    }
  } catch (error) {
    console.log("in route /depost catch error block");
    throw error;
  }
});

module.exports = transactionRoutes;
