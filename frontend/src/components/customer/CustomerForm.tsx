import React, { useState, useContext, ChangeEvent, FormEvent } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

interface CustomerFormProps {
  onSubmit: (formData: Partial<CustomerData>) => void;
  errors?: { [key: string]: string[] };
}

interface FormData {
  new_company_name: string;
  new_company_address: string;
  new_company_ico: string;
  new_company_dic: string;
  company_phone: string;
  company_person: string;
  monthly_estimate: number;
  vop: boolean;
  terms_of_use: boolean;
  gdpr: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, errors }) => {
  const { currentData } = useContext(LanguageContext);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [formData, setFormData] = useState<FormData>({
    new_company_name: "",
    new_company_address: "",
    new_company_ico: "",
    new_company_dic: "",
    company_phone: "",
    company_person: "",
    monthly_estimate: 0,
    vop: false,
    terms_of_use: false,
    gdpr: false,
  });

  // Handle form input changes, including checkboxes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const langMonthlyEstimate = {
    cz: "Váš přibližný objem prádla",
    ru: "Ваш объём белья",
    en: "Your volume of linen",
  };
  const lang = currentData?.lang || "cz";
  const labelMonthlyEstimate = langMonthlyEstimate[lang] || langMonthlyEstimate.en;
  const langKg = {
    cz: "Kg/raz",
    ru: "Кг за раз",
    en: "Kg/pc",
  };
  const labelKg = langKg[lang] || langKg.en;

  // Prevent rendering if language context data is unavailable
  if (!currentData) {
    return <div>language data not faunded</div>;
  }

  return (
      <div className="card company-card card-form">
        <form onSubmit={handleSubmit}>
          {/* Company Name */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="new_company_name">{currentData.customer.company_name}*</label>
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <input
                  className="form-control"
                  type="text"
                  name="new_company_name"
                  value={formData.new_company_name}
                  onChange={handleChange}
                  required
              />
            </div>
          </div>

          {/* Company address */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="new_company_address">{currentData.customer.company_address}*</label>
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <input
                  className="form-control"
                  type="text"
                  name="new_company_address"
                  value={formData.new_company_address}
                  onChange={handleChange}
                  required
              />
            </div>
          </div>

          {/* Company ico */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="new_company_ico">{currentData.customer.company_number}*</label>
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <input
                  className="form-control"
                  type="text"
                  name="new_company_ico"
                  value={formData.new_company_ico}
                  onChange={handleChange}
                  required
              />
            </div>
          </div>

          {/* Company dic */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="new_company_dic">{currentData.customer.vat_number}</label>
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <input
                  className="form-control"
                  type="text"
                  name="new_company_dic"
                  value={formData.new_company_dic}
                  onChange={handleChange}
              />
            </div>
          </div>

          {/* Company phone */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="company_name">{currentData.customer.phone}*</label>
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
              {errors?.company_phone && (
                  <small className="text-danger">{errors.company_phone[0]}</small>
              )}
            </div>
          </div>

          {/* Company person */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="company_name">{currentData.customer.full_name}*</label>
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

          {/* Company monthly_estimate */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-6 col-xl-3 label-form">
              <label htmlFor="monthly_estimate">{labelMonthlyEstimate || "Your volume of linen"}*</label>
            </div>
            <div className="col-6 col-md-2 col-lg-3 col-xl-2">
              <input
                  className="form-control"
                  type="text"
                  name="monthly_estimate"
                  value={formData.monthly_estimate}
                  onChange={handleChange}
                  required
              />
            </div>
            <div className="col-6 col-lg-3" style={{paddingTop:"8px"}}><span>{labelKg || "Kg/raz"}</span></div>
          </div>

          {/* VOP Checkbox */}
          <div className="row row-form">
            <div className="col-12 col-4 col-md-5 col-lg-6 col-xl-4 label-form">
              <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    name="vop"
                    checked={formData.vop}
                    onChange={handleChange}
                    required
                />
                <label className="form-check-label">{currentData.customer.vop_check}*</label>
              </div>
            </div>
            <div className="col-12 col-8 col-md-7 col-lg-6 col-xl-8">
              <div className="form-control">
                <a href="/info/vop" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  {currentData.customer.vop}
                </a>
              </div>
            </div>
          </div>

          {/* Terms of Use Checkbox */}
          {/*<div className="row row-form">*/}
          {/*  <div className="col-12 col-4 col-md-5 col-lg-6 col-xl-4 label-form">*/}
          {/*    <div className="form-check">*/}
          {/*      <input*/}
          {/*          className="form-check-input"*/}
          {/*          type="checkbox"*/}
          {/*          name="terms_of_use"*/}
          {/*          checked={formData.terms_of_use}*/}
          {/*          onChange={handleChange}*/}
          {/*      />*/}
          {/*      <label className="form-check-label">{currentData.customer.terms_use_check}*</label>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <div className="col-12 col-8 col-md-7 col-lg-6 col-xl-8">*/}
          {/*    <div className="form-control">*/}
          {/*      <a href="#" target="_blank" rel="noopener noreferrer">*/}
          {/*        <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />*/}
          {/*        {currentData.customer.terms_use}*/}
          {/*      </a>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* GDPR Checkbox */}
          <div className="row row-form">
            <div className="col-12 col-4 col-md-5 col-lg-6 col-xl-4 label-form">
              <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    name="gdpr"
                    checked={formData.gdpr}
                    onChange={handleChange}
                    required
                />
                <label className="form-check-label">{currentData.customer.gdpr_check}*</label>
              </div>
            </div>
            <div className="col-12 col-8 col-md-7 col-lg-6 col-xl-8">
              <div className="form-control">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  {currentData.customer.gdpr}
                </a>
              </div>
            </div>
          </div>
          <div className="row row-form">
            <button style={{ width: "200px" }} className="btn-submit mt-3" type="submit">
              {currentData.buttons.submit}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CustomerForm;