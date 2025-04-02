import Header from "../Header";
import Footer from "../Footer";
import PasswordResetForm from "./PasswordResetForm";

const ForgotPas: React.FC = () => {
    return (
        <>
            <Header />
                <div className="container margin-top-130 wrapper forgot-pass">
                    <div className="form-login">
                        <div className="card card-login">
                            <div className="card-body">
                            <PasswordResetForm />
                            </div>
                        </div>
                    </div>
                </div>
            <Footer />
        </>
    );
};

export default ForgotPas;