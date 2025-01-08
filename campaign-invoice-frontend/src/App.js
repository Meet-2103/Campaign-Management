import React, { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CampaignDashboard from "./components/CampaignDashboard";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  return token ? (
    <CampaignDashboard token={token} />
  ) : (
    <div>
      <Register />
      <Login setToken={setToken} />
    </div>
  );
};

export default App;
