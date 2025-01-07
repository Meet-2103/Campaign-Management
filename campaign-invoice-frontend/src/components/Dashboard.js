import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ token }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/me", {
          headers: { Authorization: token },
        });
        setUserData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, [token]);

  if (!userData) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>Welcome, {userData.first_name}!</h1>
      <p>Email: {userData.email}</p>
    </div>
  );
};

export default Dashboard;
