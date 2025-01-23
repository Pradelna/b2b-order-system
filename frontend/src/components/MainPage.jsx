import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About";
import Services from "./landing/Services";
import Technology from "./landing/Technologies";
import Price from "./landing/Price";
import Contacts from "./landing/Contacts";
import Footer from "./Footer";

function MainPage() {
    return (
      <>
        <Header />
        <StartBanner />
        <About />
        <Services />
        <Technology />
        <Price  />
        <Contacts />
        <Footer />
      </>
    );
}
  
export default MainPage;