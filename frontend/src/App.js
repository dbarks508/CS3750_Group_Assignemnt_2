import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./components/home.js";
import Register from "./components/register.js";
import Login from "./components/login.js";
import Account from "./components/account.js";
import Transfer from "./components/transfer.js";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/transfer" element={<Transfer />} />
      </Routes>
    </div>
  );
};

export default App;
