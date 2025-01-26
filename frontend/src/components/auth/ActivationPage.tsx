import { useEffect, useState, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ActivationPage: React.FC = () => {
  // Accessing language context
  const { currentData } = useContext(LanguageContext);

  // Return null if no data is available
  if (!currentData || !currentData.auth) {
    return null;
  }

  const messageData = currentData.auth;

  // Extract URL parameters
  const { uid, token } = useParams<{ uid: string; token: string }>();

  // Component state
  const [message, setMessage] = useState<string>("Checking link...");
  const [loading, setLoading] = useState<boolean>(true);

  // Effect to handle account activation
  useEffect(() => {
    if (uid && token) {
      axios
          .post("http://127.0.0.1:8000/api/accounts/activate/", {
            uidb64: uid,
            token: token,
          })
          .then((response) => {
            // Set success message
            setMessage(
                messageData.account_activated ||
                response.data.message ||
                "Account activated successfully"
            );
          })
          .catch((error) => {
            // Handle errors
            if (error.response) {
              setMessage(
                  messageData.activation_error ||
                  error.response.data.message ||
                  "Activation error"
              );
            } else {
              setMessage(
                  messageData.server_error ||
                  "Failed to contact the server"
              );
            }
          })
          .finally(() => {
            setLoading(false); // Stop loading spinner
          });
    } else {
      // Invalid or missing token
      setMessage(
          messageData.invalid_token ||
          "Invalid or expired link"
      );
      setLoading(false);
    }
  }, [uid, token, messageData]);

  return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg">
              <div className="card-body text-center">
                {loading ? (
                    // Show loading spinner while processing
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                ) : (
                    // Show the message after loading
                    <>
                      <h3
                          className={`mb-4 ${
                              message === messageData.account_activated
                                  ? "text-success"
                                  : "text-danger"
                          }`}
                      >
                        {message}
                      </h3>
                      <Link
                          to={`${
                              message === messageData.account_activated
                                  ? "/account/"
                                  : "/"
                          }`}
                          className="btn-link"
                      >
                        {messageData.button_ok || "OK"}
                      </Link>
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ActivationPage;