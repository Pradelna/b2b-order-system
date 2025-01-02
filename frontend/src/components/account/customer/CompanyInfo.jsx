import React, { useState, useEffect } from "react";
import CustomerForm from "./CustomerForm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faBuilding, faIdCard, faPhone, faEnvelope, faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../auth.js";

function CompanyInfo({ language, languageData }) {
  const currentData = languageData.find(item => item.lang === language);
  const data = currentData ? currentData['service'] : null;
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("Access Token:", token);
  
    // fetch("http://127.0.0.1:8000/api/customer/data/", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`, // Передаем токен
    //   },
    fetchWithAuth("http://127.0.0.1:8000/api/customer/data/", {
      method: "GET",
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Customer data:", data);
        setCustomerData(data);
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
      })
      .finally(() => {
        setLoading(false); // Устанавливаем loading в false в любом случае
      });
  }, []);

  const handleFormSubmit = (formData) => {
    console.log("Form data:", formData); // Проверьте, что отправляемые данные корректны
    const token = localStorage.getItem("accessToken");
    fetchWithAuth("http://localhost:8000/api/customer/data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error("Server error:", errorData); // Логируем данные ошибки
            throw new Error("Failed to submit customer data");
          });
        }
        return response.json();
      })
      .then((data) => {
        setCustomerData(data);
      })
      .catch((error) => {
        console.error("Error submitting customer data:", error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!customerData) {
    return (
      <div>
        <h1>Add Customer Information</h1>
        <CustomerForm onSubmit={handleFormSubmit} />
      </div>
    );
  }

  return (
    <div className="card company-card">
      <h5 className="company-name">
        <FontAwesomeIcon icon={faBuilding} className="icon" /> <span className="ms-1">{customerData.company_name}</span>
      </h5>
      <p className="company-info">
        <FontAwesomeIcon icon={faLocationDot} className="icon" /> <span className="ms-2">{customerData.company_address}</span>
      </p>
      <p className="company-info">
        <FontAwesomeIcon icon={faIdCard} className="icon" /> <span className="ms-1">ICO {customerData.company_ico}</span>
      </p>
      <p className="company-info">
        <FontAwesomeIcon icon={faPhone} className="icon" /> <span className="ms-1">{customerData.company_phone}</span>
      </p>
      <p className="company-info">
        <FontAwesomeIcon icon={faEnvelope} className="icon" /> <span className="ms-1">{customerData.company_email}</span>
      </p>
      <p className="company-info">
        <FontAwesomeIcon icon={faUserTie} className="icon" /> <span className="ms-1">{customerData.company_person}</span>
      </p>
    </div>
  );
}

export default CompanyInfo;