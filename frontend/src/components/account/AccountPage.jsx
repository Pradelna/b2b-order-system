import HeaderAccount from "../HeaderAccount";
import Account from "./Account";
import Footer from "../Footer";


function AccountPage({ language, languageData, handleLanguageChange }) {
    return (
      <>
        <HeaderAccount
          language={language}
          languageData={languageData}
          handleLanguageChange={handleLanguageChange}
        />
        <Account language={language} languageData={languageData} />
        <Footer language={language} languageData={languageData} />
      </>
    );
}
  
export default AccountPage;