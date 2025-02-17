import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About.js";
import Services from "./landing/Services.js";
import Technology from "./landing/Technologies.js";
import Price from "./landing/Price.js";
import Contacts from "./landing/Contacts.js";
import Footer from "./Footer";

const MainPage: React.FC = () => {
    return (
        <>
            <Header />
            <StartBanner />
            <About />
            <Services />
            <Technology />
            <Price />
            <Contacts />
            <Footer />
        </>
    );
};

export default MainPage;