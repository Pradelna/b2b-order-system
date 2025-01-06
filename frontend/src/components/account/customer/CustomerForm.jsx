import React, { useState } from "react";

const CustomerForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    company_ico: "",
    company_phone: "",
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
    <div className="card company-card card-form">
    <form onSubmit={handleSubmit}>
      <div className="row mb-1">
        <div className="col-3 label-form">
            <label>Company Name*</label>
        </div>
        <div className="col-9">
            <input
            className="form-control"
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            />  
        </div>
      </div>
      
      <div className="row">
        <div className="col-3 label-form">
            <label>Company Address*</label>
        </div>
        <div className="col-9">
            <input
            className="form-control"
            type="text"
            name="company_address"
            value={formData.company_address}
            onChange={handleChange}
            required
            />
        </div>
      </div>
      
      <div className="row">
        <div className="col-3 label-form">
            <label>Company ICO*</label>
        </div>
        <div className="col-9">
            <input
            className="form-control"
            type="text"
            name="company_ico"
            value={formData.company_ico}
            onChange={handleChange}
            required
            />
        </div>
      </div>
      
      <div className="row">
        <div className="col-3 label-form">
            <label>Company Phone*</label>
        </div>
        <div className="col-9">
            <input
            className="form-control"
            type="text"
            name="company_phone"
            value={formData.company_phone}
            onChange={handleChange}
            required
            />
        </div>
      </div>
      
      <div className="row">
        <div className="col-3 label-form">
            <label>Company Person*</label>
        </div>
        <div className="col-9">
            <input
            className="form-control"
            type="text"
            name="company_person"
            value={formData.company_person}
            onChange={handleChange}
            required
            />
        </div>
      </div>

      <button style={{width: "200px"}} className="btn-submit mt-3" type="submit">Submit</button>
    </form>
    </div>
  );
};

export default CustomerForm;