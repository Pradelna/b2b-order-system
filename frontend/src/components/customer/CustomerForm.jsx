import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const CustomerForm = ({ onSubmit, currentData }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    company_ico: "",
    company_dic: "",
    company_phone: "",
    company_person: "",
    vop: false,
    terms_of_use: false,
    gdpr: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value, // Исправлено для чекбоксов
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card company-card card-form">
      <form onSubmit={handleSubmit}>
        {/* Company Name */}
        <div className="row mb-1">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_name">{ currentData.customer.company_name }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
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

        {/* Company Address */}
        <div className="row">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_address">{ currentData.customer.company_address }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
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

        {/* Company ICO */}
        <div className="row">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_ico">{ currentData.customer.company_number }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
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

        {/* Company DIC */}
        <div className="row">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_dic">{ currentData.customer.vat_number }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
            <input
              className="form-control"
              type="text"
              name="company_dic"
              value={formData.company_dic}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Company Phone */}
        <div className="row">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_phone">{ currentData.customer.phone }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
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

        {/* Company Person */}
        <div className="row">
          <div className="col-12 col-md-4 col-lg-3 label-form">
            <label htmlFor="company_person">{ currentData.customer.full_name }*</label>
          </div>
          <div className="col-12 col-md-8 col-lg-9">
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

        {/* VOP Checkbox */}
        <div className="row">
          <div className="col-12 col-4 col-md-5 label-form">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="vop"
                checked={formData.vop}
                onChange={handleChange}
                required
              />
              <label className="form-check-label">
              { currentData.customer.vop_check }*
              </label>
            </div>
          </div>
          <div className="col-12 col-8 col-md-7">
            <div className="form-control">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                { currentData.customer.vop }
              </a>
            </div>
          </div>
        </div>

        {/* Terms of Use Checkbox */}
        <div className="row">
          <div className="col-12 col-4 col-md-5 label-form">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="terms_of_use"
                checked={formData.terms_of_use}
                onChange={handleChange}
                required
              />
              <label className="form-check-label">
              { currentData.customer.terms_use_check }*
              </label>
            </div>
          </div>
          <div className="col-12 col-8 col-md-7">
            <div className="form-control">
            <a href="#" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon
                        icon={faFilePdf}
                        className="file-uploaded"
                    /> { currentData.customer.terms_use }
                </a>
            </div> 
        </div>
        </div>

        {/* GDPR Checkbox */}
        <div className="row">
          <div className="col-12 col-4 col-md-5 label-form">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="gdpr"
                checked={formData.gdpr}
                onChange={handleChange}
                required
              />
              <label className="form-check-label">
              { currentData.customer.gdpr_check }*
              </label>
            </div>
          </div>
          <div className="col-12 col-8 col-md-7">
            <div className="form-control">
            <a href="#" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon
                        icon={faFilePdf}
                        className="file-uploaded"
                    /> { currentData.customer.gdpr }
                </a>
            </div> 
        </div>
        </div>

        <button style={{ width: "200px" }} className="btn-submit mt-3" type="submit">
        { currentData.buttons.submit }
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;