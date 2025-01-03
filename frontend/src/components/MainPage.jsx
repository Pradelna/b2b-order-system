import Header from "./Header";
import StartBanner from "./landing/StartBanner";
import About from "./landing/About";
import Services from "./landing/Services";
import Technology from "./landing/Technologies";
import Price from "./landing/Price";
import Contacts from "./landing/Contacts";
import Footer from "./Footer";

function MainPage({ language, languageData, handleLanguageChange }) {
    return (
      <>
        <Header
          language={language}
          languageData={languageData}
          handleLanguageChange={handleLanguageChange}
        />
        <StartBanner language={language} bannerData={languageData} />
        <About language={language} bannerData={languageData} />
        <Services language={language} servicesData={languageData} />
        <Technology language={language} techData={languageData} />
        <Price language={language} priceData={languageData} />
        <Contacts language={language} langData={languageData} />
        <Footer language={language} languageData={languageData} />
      </>
    );
}
  
export default MainPage;