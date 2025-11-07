import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./home.css";
import PieChartWithCustomizedLabel from "./pieChart"

export default function Home() {

  // Getting all user information for display
  const [name1, settingName] = useState("");
  const [accountNumber1, settingAccountNumber] = useState(null);
  const [balances, settingBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [masterTransactionList, setMasterTransactionList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");

  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      const response = await fetch(`http://localhost:4000/verify`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === "no session set") {
        navigate("/");
      }
      // else {
      //   setName(data.username);
      //   setAccountNumber(data.accountNumber);
      // }
    }
    run();
    return;
  }, [navigate]);

  async function logout(e) {
    e.preventDefault();

    const response = await fetch(`http://localhost:4000/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    if (data.message === "successfully logged out") {
      navigate("/login");
    }
    // else {
    //   setErrorMessage(data.message);
    // }
  }

  function goToAccountPage() {
    navigate("/account");
  }

  function goToTransferPage() {
    navigate("/transfer"); 
  }

  // Getting user information and all transactions
  useEffect(() => {
    async function getUserInformation() {
      try {
        const response = await fetch(`http://localhost:4000/accountBalances`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        console.log('Account data received:', data);

        settingName(data.name);
        settingAccountNumber(data.accountNumber);
        settingBalances(data.accountBalances || []);
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    }

    // Getting all transaction data from /transactions route
    async function getTransactions() {
      try {
        console.log('Attempting to fetch transactions...');
        const response = await fetch(`http://localhost:4000/transactionHistory`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transactions data received:', data);

        // Checking is data.transactions is an array of items
        const rawTransactions = data.transactions || [];

        console.log("1. Raw transactions array (before filter):", rawTransactions);

        const formattedData = rawTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((transaction) => {
          const rawAmount = parseFloat(transaction.amount);
          // Checking the action and making it `-` if it is withdraw
          const amount = transaction.action === 'withdraw' ? -rawAmount: rawAmount;
          const category= transaction.category ? transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) : "N/A (no name inputted)";
          const amountClass = amount < 0 ? 'transaction-amount-debt' : 'transaction-amount-gain';
          return {
            id: transaction.id,
            accountIndex: transaction.accountIndex,
            category: category,
            date: new Date(transaction.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            amountFormatted: amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              signDisplay: "exceptZero",
            }),
            amountClass: amountClass,
            amount: amount,
          };
        });

        setMasterTransactionList(formattedData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }

    getUserInformation();
    getTransactions();
  }, []);

  function handleAccountChange(e) {
    setSelectedAccount(e.target.value);
  }

  useEffect(() => {
    let filteredList = masterTransactionList;

    // Getting the account name for the last one in the index that can change
    const lastAccountName = balances[2] ? balances[2].name.charAt(0).toUpperCase() + balances[2].name.slice(1) : "";

    // Filter based on account name
    if (selectedAccount === "Savings") {
      filteredList = masterTransactionList.filter(t => t.accountIndex === "");
    } else if (selectedAccount === "Checking") {
      filteredList = masterTransactionList.filter(t => t.accountIndex === "1");
    } else if (lastAccountName && selectedAccount === lastAccountName) {
      filteredList = masterTransactionList.filter(t => t.accountIndex === "2");
    }

    // Updating displayed transactions
    setTransactions(filteredList);
  }, [selectedAccount, masterTransactionList, balances]);

// Data for the pie chart
const expenseTransactions = transactions.filter(t => t.amount < 0);
// Grouping the category and gettign the sum of the amounts:
const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
  const category = transaction.category;
  const amount = Math.abs(transaction.amount);

  if (!acc[category]) {
    acc[category] = 0;
  }
  acc[category] += amount;
  return acc;
}, {});

// Formatting the data for the chart
const pieChartData = Object.keys(categoryTotals).map((category, index) => ({
  id: index,
  value: categoryTotals[category],
  label: category,
}));

// Main HTML Return
return (
    // Container for all HTML
    <div className="body">
      <div className="container">

        <header className="header">
          <h1>Dashboard</h1>
        </header>

        {/* Top Half: Account Info & Actions */}
        <section className="account-grid">
          {/* Left Column: Account Info */}
          <div className="account-info">
            {/* Need to get rid of padding on bottom of h2 */}
            <h2 style={{ marginBottom: 0 }}>Hello, {name1 || "{userName}\n"}</h2>
            <h2 style={{ marginTop: 0 }}>Account Number: {accountNumber1}</h2>

            {/* Account Balances */}
            <div className="balances-grid">
              {balances.map((account) => (
                <div className="balance-card" key={account.name}>
                  <div>
                    {/* Capitalizing the first letter of the account */}
                    <span>
                      {account.name.charAt(0).toUpperCase() + account.name.slice(1)}:
                    </span>
                  </div>
                  <p>
                    {/* Formatting the number */}
                    {account.balance.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>
              ))}
            </div>

            {/* Dropdown Selection */}
            <div>
              <label htmlFor="account-select">
                View transactions for:
              </label>
              <select id="account-select" className="account-select" value={selectedAccount} onChange={handleAccountChange}>
                <option>All Accounts</option>
                {balances.map((account) => (
                  <option key={account.name}>
                    {account.name.charAt(0).toUpperCase() + account.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Account Actions */}
          <div className="account-actions">
            <h3>Account Actions</h3>

            {/* Transfer Button */}
            <button onClick={goToTransferPage} className="btn btn-primary">
              <span>Transfer</span>
            </button>

            {/* Account Actions Button */}
            <button onClick={goToAccountPage} className="btn btn-secondary">
              <span>Account Page</span>
            </button>

            {/* Logout button */}
            <button onClick={logout} className="btn btn-danger">
              <span>Logout</span>
            </button>
          </div>
        </section>

        {/* Bottom Section: Transaction History */}
        <section className="transactions-section">
          <h2 className="transactions-header">Transaction History</h2>

          <div className="transactions-layout">
            {/* Left Column: Selected History Feed */}
            <div className="history-feed">
              <h3>Selected History Feed</h3>
              <div className="history-feed-list">
                {/* Checking for transactions */}
                {transactions.length === 0 ? (
                  <p>No transactions available.</p>
                ) : (
                  // Mapping through transactions
                  transactions.map((transaction) => (
                    <div className="transaction-item" key={transaction.id}>
                      <div className="transaction-item-details">
                        <div>
                          <p>{transaction.category}</p>
                          <p className="date">{transaction.date}</p>
                        </div>
                      </div>
                      <span className={transaction.amountClass}>
                        {transaction.amountFormatted}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Pie Chart */}
            <div>
              <PieChartWithCustomizedLabel data={pieChartData} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
