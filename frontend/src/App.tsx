import ForgotPas from "./components/auth/ForgotPas";
import ScrollToTop from "./components/utils/ScrollToTop";

const BASE_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/auth/PrivateRoute";
import RegistrationForm from "./components/auth/RegistrationForm";
import ActivationPage from "./components/auth/ActivationPage";
import LoginForm from "./components/auth/LoginForm";
import Loader from "./components/Loader";
import MainPage from "./components/MainPage";
import MainPageWithPrefix from "./components/MainPageWithPrefix";
import AccountPage from "./components/account/AccountPage";
import CustomerDetailPage from "./components/customer/CustomerDetailPage";
import LoaderTestPage from "./components/LoaderTestPage";
import PlaceDetails from "./components/place/PlaceDetails";
import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";
import ResetPasswordComplete from "./components/auth/ResetPasswordComplete";

import "./App.css";
import ReportList from "./components/order/ReportList";
import AllOrderHistory from "./components/order/AllOrderHistory";
import Dashboard from "./components/admin/Dashboard";
import AdminRoute from "./components/admin/AdminRoute";
import CustomerDetailAdmin from "./components/admin/CustomerDetailAdmin";
import PlaceDetailAdmin from "./components/admin/PlaceDetailAdmin";
import AllHistoryAdmin from "./components/admin/AllHistoryAdmin";
import Invoices from "./components/admin/Invoices";
import Vop from "./components/info/Vop";
import Gdpr from "./components/info/Gdpr";

// Define the shape of the language data
interface LanguageData {
  [key: string]: any; // Adjust the structure as per your API response
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<string>(
      localStorage.getItem("language") || "cz"
  );
  const [languageData, setLanguageData] = useState<LanguageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load language data
  useEffect(() => {
    const fetchLanguageData = async () => {
      try {
        const response = await fetch(
            `${BASE_URL}/landing/?lang=${language}`
        );
        const data: LanguageData = await response.json();
        setLanguageData(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load language data.");
      }
    };

    fetchLanguageData();
  }, [language]);

  const handleLanguageChange = (lang: string) => {
    if (lang !== language) {
      setLanguage(lang);
      localStorage.setItem("language", lang);
    }
  };

    useEffect(() => {
        fetch('/version.json', { cache: 'no-store' })
            .then((res) => res.text())
            .then((version) => {
                const CURRENT_VERSION = '1.0.0';
                if (version.trim() !== CURRENT_VERSION) {
                    console.log('%c[App] New version detected. Reloading...', 'color: orange; font-weight: bold');
                    // window.location.reload();
                } else {
                    console.log(`%c[App] Version ${CURRENT_VERSION} is up-to-date`, 'color: green;');
                }
            })
            .catch((err) => console.error('[App] Version check failed:', err));
    }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }



  return (
      <BrowserRouter>
        <div className="App">
          <ScrollToTop />
          <Routes>
            {/* Main page without prefix */}
            <Route path="/" element={<MainPage />} />

            {/* Main page with prefix */}
            <Route path="/:lang" element={<MainPageWithPrefix />} />

            {/* Account page with private access */}
            <Route
                path="/account/*"
                element={
                  <PrivateRoute>
                    <AccountPage />
                  </PrivateRoute>
                }
            />

              <Route path="/info/vop" element={<Vop />} />
              <Route path="/info/gdpr" element={<Gdpr />} />

            {/* Registration page */}
            <Route path="/account/auth" element={<RegistrationForm />} />

            {/* Activation page */}
            <Route path="/activate/:uid/:token" element={<ActivationPage />} />

            {/* Login page */}
            <Route path="/account/login" element={<LoginForm />} />

            {/* Loader test page */}
            <Route path="/loader-test" element={<LoaderTestPage />} />

            {/* Customer detail page */}
            <Route
                path="/customer/:customerId"
                element={
                  <PrivateRoute>
                    <CustomerDetailPage
                        language={language}
                        languageData={languageData}
                        handleLanguageChange={handleLanguageChange}
                    />
                  </PrivateRoute>
                }
            />

            {/* Place details page */}
            <Route
                path="/place/:id"
                element={
                  <PrivateRoute>
                    <PlaceDetails />
                  </PrivateRoute>
                }
            />

            {/* Invoices page */}
            <Route
                path="/invoices"
                element={
                  <PrivateRoute>
                    <ReportList />
                  </PrivateRoute>
                }
            />

            {/* All order history page */}
            <Route
                path="/all-orders"
                element={
                  <PrivateRoute>
                    <AllOrderHistory />
                  </PrivateRoute>
                }
            />

          {/* admin */}
          <Route
              path="/admin/dashboard"
              element={
                  <AdminRoute>
                      <Dashboard />
                  </AdminRoute>
              }
          />

          <Route
              path="/admin/customer-detail/:customerId"
              element={
                  <AdminRoute>
                      <CustomerDetailAdmin />
                  </AdminRoute>
                  }
          />

          <Route
              path="/admin/place-detail/:id"
              element={
                  <AdminRoute>
                      <PlaceDetailAdmin />
                  </AdminRoute>
              }
          />

              <Route
                  path="/admin/user-history/:customerId"
                  element={
                      <AdminRoute>
                          <AllHistoryAdmin />
                      </AdminRoute>
                  }
              />

              <Route
                  path="/admin/user-invoices/:customerId"
                  element={
                      <AdminRoute>
                          <Invoices />
                      </AdminRoute>
                  }
              />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />

              {/* Страница для ввода нового пароля (переход по ссылке из email) */}
              <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirm />} />

              {/* Страница после успешного сброса пароля */}
              <Route path="/reset-password/done" element={<ResetPasswordComplete />} />

              <Route path="/forgot-password" element={<ForgotPas />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
};

export default App;