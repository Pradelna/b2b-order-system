import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderAccount from "../HeaderAccount";
import Footer from "../Footer";
import PlaceEdit from "./PlaceEdit";
import OrderForm from "../order/OrderForm";
import { fetchWithAuth } from "../account/auth";

function DetailPlace ({ language, languageData, handleLanguageChange }) {
  const { id } = useParams(); // Получаем ID места из URL
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    // Получение данных о месте по ID
    const fetchPlace = async () => {
      try {
        const response = await fetchWithAuth(
          `http://127.0.0.1:8000/api/place/${id}/`
        );
        if (response.ok) {
          const data = await response.json();
          setPlace(data);
        } else {
          console.error("Failed to fetch place details.");
        }
      } catch (error) {
        console.error("Error fetching place:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this place?")) {
      try {
        const response = await fetchWithAuth(
          `http://127.0.0.1:8000/api/place/delete/${id}/`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
        //   alert("Place deleted successfully!");
          navigate("/account", { state: { successMessage: "Place deleted successfully!" } });
        } else {
          console.error("Failed to delete place.");
        }
      } catch (error) {
        console.error("Error deleting place:", error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!place) return <p>Place not found.</p>;

  return (
    <>
        <HeaderAccount
          language={language}
          languageData={languageData}
          handleLanguageChange={handleLanguageChange}
        />

        <div className="container margin-top-130 wrapper">
            <div className="row other-card">
                <div className="card">
                    <h1>Place Details</h1>
                    {!showEditForm ? (
                        
                        
                        <div>
                            
                        <div className="row mb-2">
                            <div className="col-12">
                                <div className="form-control">
                                    <strong>Name:</strong> {place.place_name}
                                </div>
                            </div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-12">
                                <div className="form-control">
                                    <strong>Address:</strong> {place.rp_street}, {place.rp_city},{" "}
                                    {place.rp_zip}
                                </div>
                            </div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-12">
                                <div className="form-control">
                                    <strong>Contact Person:</strong> {place.rp_person}
                                </div>
                            </div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-12">
                                <div className="form-control">
                                    <strong>Phone:</strong> {place.rp_phone}
                                </div>
                            </div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-12">
                                <div className="form-control">
                                <strong>Email:</strong> {place.rp_email}
                                </div>
                            </div>
                        </div>
                        

                        <button
                            className="btn-submit mt-3"
                            onClick={() => setShowEditForm(true)}
                        >
                            Edit Place
                        </button>
                        <button className="btn-link mt-3" onClick={handleDelete}>
                            Delete Place
                        </button>
                        </div>
                    ) : (
                        <PlaceEdit
                        place={place}
                        onClose={() => setShowEditForm(false)}
                        onPlaceUpdated={setPlace}
                        />
                    )}
                        
                </div>
                
            </div>
            
      <h2>Create Order</h2>
      <OrderForm placeId={id} />
    
        </div>
    <Footer language={language} languageData={languageData} />
    </>
  );
};

export default DetailPlace;