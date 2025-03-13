import { LanguageContext } from "../../context/LanguageContext.js";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import PasswordResetForm from "./PasswordResetForm";

const ForgotPas: React.FC = () => {
    return (
        <>
            <Header />
                <div className="container margin-top-130 wrapper">
                    <div className="form-login">
                        <div className="card card-login">
                            <PasswordResetForm />
                        </div>
                    </div>
                </div>
            <Footer />
        </>
    );
};

export default ForgotPas;