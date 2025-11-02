import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./account.css";

export default function Account() {
  const [accountNumber, setAccountNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState(0);
  const [updatedAmount, setUdatedAmount] = useState(0);
  const [form, setForm] = useState({
    catagory: "",
    amount: "",
    account: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      const responce = await fetch(`http://localhost:4000/verify`, {
        method: "GET",
        credentials: "include",
      });

      const data = await responce.json();

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
      catagory: form.catagory,
      accountNumber: accountNumber,
      accountIndex: form.account,
      amount: form.amount,
    };

    // send to backend
    const response = await fetch(`http://localhost:4000/deposit`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(deposit),
    });

    // handle responce
    const data = await response.json();
    if (data.message == "deposit successful") {
      setMessage(data.message);
      setAccount(data.account);
      setUdatedAmount(data.amount);
    }
  }

  return (
    <div class="container">
      <form onSubmit={onDeposit}>
        <div>
          <label>Catagory: </label>
          <input
            type="text"
            id="catagory"
            value={form.catagory}
            onChange={(e) => updateForm({ catagory: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Amount: </label>
          <input
            type="number"
            id="amount"
            value={form.catagory}
            onChange={(e) => updateForm({ catagory: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Account: </label>
          <select name="account" id="account">
            <option value={form.account}>Account #1 - savings</option>
            <option value={form.account}>Account #2 - checking</option>
            <option value={form.account}>Account #3 - other</option>
          </select>
        </div>

        <input type="submit" value="Deposit"></input>
      </form>
      <div class="results">
        <div>{message && <p>{message}</p>}</div>
        <div>{account && <p>{account}</p>}</div>
        <div>{updatedAmount && <p>{updatedAmount}</p>}</div>
      </div>
    </div>
  );
}
