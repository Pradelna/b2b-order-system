import React, { useState } from "react";

const CustomerForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    company_ico: "",
    company_phone: "",
    // company_email: "",
    company_person: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Company Name</label>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Company Address</label>
        <input
          type="text"
          name="company_address"
          value={formData.company_address}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Company ICO</label>
        <input
          type="text"
          name="company_ico"
          value={formData.company_ico}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Company Phone</label>
        <input
          type="text"
          name="company_phone"
          value={formData.company_phone}
          onChange={handleChange}
        />
      </div>
      {/* <div>
        <label>Company Email</label>
        <input
          type="email"
          name="company_email"
          value={formData.company_email}
          onChange={handleChange}
          required
        />
      </div> */}
      <div>
        <label>Company Person</label>
        <input
          type="text"
          name="company_person"
          value={formData.company_person}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default CustomerForm;