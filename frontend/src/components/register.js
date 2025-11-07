import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./login.css";

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordCheck: "",
  });

  const navigate = useNavigate();

  function updateForm(jsonObj) {
    return setForm((prevJsonObj) => {
      return { ...prevJsonObj, ...jsonObj };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (form.password !== form.passwordCheck) {
      setErrorMessage("passwords do not match");
      return;
    } else if (!regex.test(form.password)) {
      setErrorMessage("password does not meet the minimum specifications");
      return;
    }

    const newUser = {
      username: form.username,
      password: form.password,
    };

    const result = await fetch("http://localhost:4000/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newUser),
    }).catch((error) => {
      console.log(error);
    });

    const data = await result.json();

    if (data.error) {
      setErrorMessage(data.error);
      return;
    }

    // success - navigate to home with log in session
    navigate("/home");
  }

  function toLogin(e) {
    e.preventDefault();
    navigate("/login");
  }

  return (
    <div className="body">
      <h1>Your Bank</h1>
      <h3>Register</h3>
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
        <div>
          <label>Confirm Password: </label>
          <input
            type="password"
            id="PasswordCheck"
            value={form.passwordCheck}
            onChange={(e) => updateForm({ passwordCheck: e.target.value })}
            required
          />
        </div>
        <p>
          (Password must contain at least: 1 uppercase, 1 lowercase, 1 digit, 1
          special character, 8 total characters)
        </p>
        <br />
        <div>
          <input type="submit" value="Register"></input>
        </div>
      </form>

      <div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
      <div className="bottom-nav">
        <p>Already a user?</p>
        <button onClick={toLogin}>Go To Login</button>
      </div>
    </div>
  );
}
