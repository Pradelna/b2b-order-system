import { useState, useContext, ChangeEvent, FormEvent } from "react";
import { LanguageContext } from "../../context/LanguageContext.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

interface CustomerFormProps {
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  company_name: string;
  company_address: string;
  company_ico: string;
  company_dic: string;
  company_phone: string;
  company_person: string;
  vop: boolean;
  terms_of_use: boolean;
  gdpr: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit }) => {
  const { currentData } = useContext(LanguageContext);
  const [formData, setFormData] = useState<FormData>({
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

  // Prevent rendering if language context data is unavailable
  if (!currentData) {
    return null;
  }

  return (
      <div className="card company-card card-form">
        <form onSubmit={handleSubmit}>
          {/* Company Name */}
          <div className="row mb-1">
            <div className="col-12 col-md-4 col-lg-3 label-form">
              <label htmlFor="company_name">{currentData.customer.company_name}*</label>
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

          {/* Repeat similar structure for other fields */}

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
                <label className="form-check-label">{currentData.customer.vop_check}*</label>
              </div>
            </div>
            <div className="col-12 col-8 col-md-7">
              <div className="form-control">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  {currentData.customer.vop}
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
                <label className="form-check-label">{currentData.customer.terms_use_check}*</label>
              </div>
            </div>
            <div className="col-12 col-8 col-md-7">
              <div className="form-control">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  {currentData.customer.terms_use}
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
                <label className="form-check-label">{currentData.customer.gdpr_check}*</label>
              </div>
            </div>
            <div className="col-12 col-8 col-md-7">
              <div className="form-control">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  {currentData.customer.gdpr}
                </a>
              </div>
            </div>
          </div>

          <button style={{ width: "200px" }} className="btn-submit mt-3" type="submit">
            {currentData.buttons.submit}
          </button>
        </form>
      </div>
  );
};

export default CustomerForm;