import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./account.css";

export default function Account() {
  const [accountNumber, setAccountNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [account, setAccount] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState(null);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    account: "",
  });

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
      } else {
        setAccountNumber(data.accountNumber);
      }
    }
    run();
    return;
  }, []);

  // clears form fields if message is displayed and sets timout for error mesages
  useEffect(() => {
    setForm({ category: "", amount: "", account: "" });

    const timeout = setTimeout(() => {
      if (message) {
        setMessage("");
      }

      if (errorMessage) {
        setErrorMessage("");
      }

      if (account) {
        setAccount(null);
      }

      if (updatedAmount) {
        setUpdatedAmount(null);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [message, errorMessage, account, updatedAmount]);

  // helpr function to update form on change
  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj };
    });
  }

  async function onSubmit(actionType) {
    const accountAction = {
      category: form.category,
      accountNumber: accountNumber,
      accountIndex: form.account,
      amount: form.amount,
    };

    // send to backend
    const response = await fetch(`http://localhost:4000/${actionType}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountAction),
    });

    // handle responce
    const data = await response.json();

    if (data && !data.error) {
      setMessage(data.message);
      setAccount(data.account);
      setUpdatedAmount(data.updatedAmount);
    } else {
      setErrorMessage(data.error);
    }
  }

  return (
    <div className="main">
      <div className="container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label>Category: </label>
            <input
              type="text"
              id="catagory"
              value={form.category}
              onChange={(e) => updateForm({ category: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Amount: </label>
            <input
              type="number"
              id="amount"
              value={form.amount}
              onChange={(e) => updateForm({ amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Account: </label>
            <select
              name="account"
              id="account"
              value={form.account}
              onChange={(e) => updateForm({ account: e.target.value })}
            >
              <option value={0}>Account #1 - savings</option>
              <option value={1}>Account #2 - checking</option>
              <option value={2}>Account #3 - other</option>
            </select>
          </div>

          <button onClick={() => onSubmit("deposit")}>Deposit</button>
          <button onClick={() => onSubmit("withdraw")}>Withdraw</button>
        </form>
      </div>

      <div className="result">
        {message && <p>{message}</p>}
        {account && <p>Your {account} account now has </p>}
        {updatedAmount !== null && updatedAmount !== undefined && (
          <p>${updatedAmount} in it. Congratulations!</p>
        )}
      </div>

      <div>{errorMessage && <p className="error">{errorMessage}</p>}</div>
    </div>
  );
}
