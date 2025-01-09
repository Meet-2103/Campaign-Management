import React, { useState, useEffect } from "react";
import axios from "axios";

const InvoiceDashboard = ({ token }) => {
  const [invoices, setInvoices] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error.message);
      alert("Failed to fetch invoices. Please check the backend API.");
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
      await axios.post("http://localhost:5000/invoices/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Invoices uploaded successfully!");
      fetchInvoices(); // Refresh the invoices list
    } catch (error) {
      console.error("Error uploading invoices:", error.message);
      alert("Failed to upload the CSV file. Please ensure the format is correct.");
    }
  };

  const downloadPDF = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/invoices/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for file downloads
      });

      // Create a downloadable link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${id}.pdf`); // Filename for the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error.message);
      alert("Failed to download the PDF file.");
    }
  };

  return (
    <div>
      <h1>Invoice Dashboard</h1>

      {/* File Upload Form */}
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload CSV</button>
      </form>

      {/* Invoice List */}
      <h2>Invoices</h2>
      {invoices.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.user_id}</td>
                <td>{invoice.invoice_date}</td>
                <td>${invoice.amount.toFixed(2)}</td>
                <td>{invoice.status}</td>
                <td>
                  <button onClick={() => downloadPDF(invoice.id)}>Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No invoices available. Please upload a CSV file to add invoices.</p>
      )}
    </div>
  );
};

export default InvoiceDashboard;
