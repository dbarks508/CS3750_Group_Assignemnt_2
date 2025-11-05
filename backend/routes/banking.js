// backend banking routes

const express = require("express");
const transactionRoutes = express.Router();
const dbo = require("../db/conn");

// deposit route
transactionRoutes.route("/deposit").post(async (req, res) => {
  try {
    // destructure req from front end
    const { category, accountNumber, accountIndex, amount } = req.body;

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
    const index = Number(accountIndex);
    const updatePath = `accounts.${index}.balance`;
    const updatedAmount = { $inc: { [updatePath]: Number(amount) } };
    let result = await usersCollection.updateOne(identifier, updatedAmount);

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ error: "no account found to deposit money from" });
    }

    const transactionCollection = db.collection("transactions");

    const transactionObject = {
      accountNumber: accountNumber,
      accountIndex: accountIndex,
      action: "deposit",
      amount: amount,
      category: category,
      date: new Date(),
    };

    result = await transactionCollection.insertOne(transactionObject);

    if (!result.acknowledged) {
      return res
        .status(400)
        .json({ error: "transation not added to transaction DB" });
    } else {
      // get updated balance
      const updatedUser = await usersCollection.findOne({
        accountNumber: accountNumber,
      });

      // send back responce to frontend
      res.json({
        message: "deposit successful",
        account: updatedUser.accounts[index].name,
        updatedAmount: updatedUser.accounts[index].balance,
      });
    }
  } catch (error) {
    console.error("in route /depost catch error block", error);
    res.status(500).json({ error: "server error - deposit" });
  }
});

transactionRoutes.route("/withdraw").post(async (req, res) => {
  try {
    // destructure req from front end
    const { category, accountNumber, accountIndex, amount } = req.body;

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

    // set up fields for withdrawal
    const identifier = { accountNumber: accountNumber };
    const index = Number(accountIndex);
    const updatePath = `accounts.${index}.balance`;

    // check if balance is sufficient to withdraw amount
    const currentBalance = user.accounts[index].balance;
    if (currentBalance < Number(amount)) {
      console.log("withdrawal error - insufficient funds");
      return res.status(400).json({ error: "insufficient funds" });
    }
    // withdraw amount into selected account
    const updatedAmount = { $inc: { [updatePath]: -Number(amount) } };
    let result = await usersCollection.updateOne(identifier, updatedAmount);

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      return res
        .status(400)
        .json({ error: "no account found to withdraw money from" });
    }

    const transactionCollection = db.collection("transactions");

    const transactionObject = {
      accountNumber: accountNumber,
      accountIndex: accountIndex,
      action: "withdraw",
      amount: amount,
      category: category,
      date: new Date(),
    };

    result = await transactionCollection.insertOne(transactionObject);

    if (!result.acknowledged) {
      return res
        .status(400)
        .json({ error: "transaction not added to transaction DB" });
    } else {
      // get updated balance
      const updatedUser = await usersCollection.findOne({
        accountNumber: accountNumber,
      });

      // send back response to frontend
      res.json({
        message: "withdrawal successful",
        account: updatedUser.accounts[index].name,
        updatedAmount: updatedUser.accounts[index].balance,
      });
    }
  } catch (error) {
    console.error("in route /withdraw catch error block", error);
    res.status(500).json({ error: "server error - withdraw" });
  }
});

transactionRoutes.route("/transactions").get(async (req, res) => {
  let accountNumber = req?.session?.accountNumber;

  if (accountNumber === undefined) {
    res.status(401).json({ error: "user needs to be logged in" });
    return;
  }

  let db = dbo.getDB();
  const col = db.collection("transactions");

  let data = await col
    .find(
      { accountNumber },
      {
        projection: {
          _id: 0,
          action: 1,
          amount: 1,
          category: 1,
          date: 1,
        },
      }
    )
    .toArray();

  res.json(data);
});

module.exports = transactionRoutes;
