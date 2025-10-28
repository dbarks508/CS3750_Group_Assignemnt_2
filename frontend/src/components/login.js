import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const user = {
      username: form.username,
      password: form.password,
    };

    const result = await fetch("http://localhost:4000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    }).catch((error) => {
      window.alert(error);
      return;
    });

    // check for validated password using json result obj
    const data = await result.json();

    if (
      data.message === "user logged in" &&
      data.username === form.username &&
      !data.error
    ) {
      navigate("/home");
    } else {
      setErrorMessage(data.error);
      setForm({ username: "", password: "" });
    }
  }

  function toRegister(e) {
    e.preventDefault();
    navigate("/");
  }

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            id="username"
            value={form.username}
            onChange={(e) => updateForm({ username: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            id="Password"
            value={form.password}
            onChange={(e) => updateForm({ password: e.target.value })}
            required
          />
        </div>
        <br />
        <div>
          <input type="submit" value="Login"></input>
        </div>
      </form>
      <div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
      <div>
        <p>Just kidding?</p>
        <button onClick={toRegister}>Go To Register</button>
      </div>
    </div>
  );
}
