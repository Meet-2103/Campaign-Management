import React, { useState, useEffect } from "react";
import axios from "axios";

const CampaignDashboard = ({ token }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/campaigns", {
        headers: { Authorization: token },
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Token: is front end", token);
      await axios.post("http://localhost:5000/campaigns/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Campaigns uploaded successfully!");
      fetchCampaigns(); // Refresh the list
    } catch (error) {
      console.error("Error Response:", error.response);

  // Check if the error response is available and print the specific message
  if (error.response && error.response.data) {
    console.error("Error Message:", error.response.data.message); // Log the error message from the API
  } else {
    console.error("An unexpected error occurred:", error.message);
  }

      alert("Failed to upload campaigns");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/campaigns/${id}`, {
        headers: { Authorization: token },
      });
      alert("Campaign deleted successfully!");
      fetchCampaigns();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Campaign Dashboard</h1>

      {/* CSV Upload */}
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload CSV</button>
      </form>

      {/* Campaign List */}
      <table>
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>PAN Card Number</th>
            <th>Budget</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.campaign_name}</td>
              <td>{campaign.pan_card_number}</td>
              <td>{campaign.budget}</td>
              <td>{campaign.start_date}</td>
              <td>{campaign.end_date}</td>
              <td>
                <button onClick={() => handleDelete(campaign.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignDashboard;
