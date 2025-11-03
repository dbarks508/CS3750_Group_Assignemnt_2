import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./account.css";

export default function Account() {
  const [accountNumber, setAccountNumber] = useState(null);
  const [message, setMessage] = useState("");
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

  // helpr function to update form on change
  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj };
    });
  }

  async function onDeposit(e) {
    e.preventDefault();

    const deposit = {
      category: form.category,
      accountNumber: accountNumber,
      accountIndex: form.account,
      amount: form.amount,
    };

    // send to backend
    const response = await fetch(`http://localhost:4000/deposit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deposit),
    });

    // handle responce
    const data = await response.json();
    if (data.message === "deposit successful") {
      console.log("json recieved fom backend:", data);
      setMessage(data.message);
      setAccount(data.account);
      setUpdatedAmount(data.updatedAmount);
    }
  }

  return (
    <div className="main">
      <div className="container">
        <form onSubmit={onDeposit}>
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

          <input type="submit" value="Deposit"></input>
        </form>
      </div>

      <div className="result">
        {message && <p>{message}</p>}
        {account && <p>Your {account} account now has </p>}
        {updatedAmount !== null && updatedAmount !== undefined && (
          <p>${updatedAmount} in it. Congratulations!</p>
        )}
      </div>
    </div>
  );
}
