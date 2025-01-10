import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = ({ token }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error.message);
      alert("Failed to fetch campaigns.");
    }
  };

  const updateCampaignStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/admin/campaigns/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Campaign ${status}.`);
      fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign status:", error.message);
      alert("Failed to update campaign status.");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/admin/upload-invoices", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Invoices uploaded successfully!");
    } catch (error) {
      console.error("Error uploading invoices:", error.message);
      alert("Failed to upload the CSV file.");
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>

      {/* Campaign Review Section */}
      <h2>Campaign Review</h2>
      {campaigns.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.id}</td>
                <td>{campaign.title}</td>
                <td>{campaign.status}</td>
                <td>
                  <button
                    onClick={() => updateCampaignStatus(campaign.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateCampaignStatus(campaign.id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No campaigns available for review.</p>
      )}

      {/* Invoice Upload Section */}
      <h2>Upload Invoices</h2>
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload CSV</button>
      </form>
    </div>
  );
};

export default AdminPanel;
