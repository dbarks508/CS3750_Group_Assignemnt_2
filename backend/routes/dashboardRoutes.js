// Backend routes for the home/dashboard page

const express = require("express");
const dashboardRoutes = express.Router();
const dbo = require("../db/conn");

// Route to get account information
// - Account Number
// - Username
// - Account Balances (mapped)
dashboardRoutes.route("/accountBalances").get(async (req, res) => {
  try {
    // Get account number from session cookie
    const accountNumber = req.session.accountNumber;
    // Connect to database and query for the user record
    let db = dbo.getDB();
    const usersCollection = db.collection("users");
    // Get username from account number
    const username = await usersCollection.findOne({ accountNumber: accountNumber });
    if (!username) {
        return res.status(404).json({ error: "User not found" });
    }
    // Get account balances
    const accountBalances = username.accounts.map((account) => {
        return {
        name: account.name,
        balance: account.balance,
        };
    });
    // Sending to frontend
    return res.json({
        name: username.username,
        accountNumber: username.accountNumber,
        accountBalances: accountBalances,
    });
  } catch (err) {
    console.error("Error in /accountBalances:", err);
    res.status(500).json({ error: "Failed to fetch account information" });
  }
});

// Route to get all transactions under an account number. It will return
// - accountNumber
// - accountIndex
// - action
// - amount
// - category
// - date   (formatted example: Oct 24, 2025)
dashboardRoutes.route("/transactionHistory").get(async (req, res) => {
  try {
    const accountNumber = req.session.accountNumber;
    console.log("Session account number:", accountNumber);
    let db = dbo.getDB();
    const transactionsCollection = db.collection("transactions");
    const userTransactions = await transactionsCollection.find({ accountNumber: accountNumber }).toArray();

    if (!userTransactions || userTransactions.length === 0) {
        console.log(`[Backend] No transactions found for account: ${accountNumber}`);
        return res.json({ transactions: [] });
    }
    // Debugging
    console.log(`[Backend] Found ${userTransactions.length} transactions`);
    // Blank list to put transactions into
    let formattedTransactions = [];
    userTransactions.forEach((transaction) => {
        // Making sure data is valid
        if (transaction && transaction._id && transaction.date && transaction.amount != null) {
            // Pushing
            formattedTransactions.push({
                id: transaction._id.toString(),
                accountNumber: transaction.accountNumber,
                accountIndex: transaction.accountIndex,
                action: transaction.action,
                amount: transaction.amount,
                category: transaction.category,
                date: transaction.date,
            });
        } else {
            console.log("[Backend] A transaction was REJECTED by the filter: ", transaction);
        }
    });

    console.log(`[Backend] Sending ${formattedTransactions.length} transactions.`);
    return res.json({ transactions: formattedTransactions });
    }
    catch (err) {
    console.error("Error in /transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = dashboardRoutes;