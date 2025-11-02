import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Account() {
  const [form, setForm] = useState({
    catagory: "",
    amount: "",
    account: "",
  });

  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj };
    });
  }

  async function onDeposit(e) {
    e.preventDefault();

    const deposit = {
      catagory: form.catagory,
      amount: form.amount,
      account: form.account,
    };
  }

  return (
    <div id="container">
      <form onSubmit={onDeposit}>
        <div>
          <label>catagory: </label>
          <input
            type="text"
            id="username"
            value={form.catagory}
            onChange={(e) => updateForm({ catagory: e.target.value })}
            required
          />
        </div>
      </form>
    </div>
  );
}
