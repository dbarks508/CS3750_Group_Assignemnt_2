import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const [userType, setUserType] = useState("");
  const [name, setName] = useState("");

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
        setUserType(data.type);
        setName(data.username);
      }
    }
    run();
    return;
  }, []);

  async function logout(e) {
    e.preventDefault();

    const responce = await fetch(`http://localhost:4000/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await responce.json();
    if (data.message === "successfully logged out") {
      navigate("/login");
    } else {
      setErrorMessage(data.message);
    }
  }

  return (
    <div>
      <h1>Home Page</h1>
      <p>Successfully navigated to the home page!</p>
      <p>Username: {name}</p>
      <p>Role type: {userType}</p>
      <br />
      <button onClick={logout}>Logout</button>
      <div>{errorMessage && <p>{errorMessage}</p>}</div>
    </div>
  );
}
