import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./components/home.js";
import Register from "./components/register.js";
import Login from "./components/login.js";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
