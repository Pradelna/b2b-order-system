import { useState, useEffect } from "react";
import { fetchWithAuth } from "./auth.js";
import HeaderAccount from "../HeaderAccount";
import Account from "./Account";
import Footer from "../Footer";

function AccountPage() {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    fetchWithAuth("http://127.0.0.1:8000/api/customer/data/", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized. Please log in again.");
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // console.log("AccountPage. Received customer data:", data);
        if (!data.company_email) {
          console.warn("No email found in customer data");
        }
        setCustomerData(data);
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <>
        <HeaderAccount />
        <Account 
            customerData={customerData} 
            setCustomerData={setCustomerData} 
        />
        <Footer />
      </>
  );
}

export default AccountPage;