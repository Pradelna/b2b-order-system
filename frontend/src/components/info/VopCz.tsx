import Header from "@/components/Header";
import React, {useContext} from "react";
import {faChevronLeft, faFilePdf} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LanguageContext } from "../../context/LanguageContext";
import FooterAccount from "../FooterAccount";
import {Link} from "react-router-dom";

const VopCz: React.FC = () => {
  const { currentData } = useContext(LanguageContext);

  return (
      <>
        <Header />
        <Link to="/" className="text-decoration-none">
          <p className="back-link">
            <FontAwesomeIcon icon={faChevronLeft} className="icon" />
            <span className="ms-2"><strong>{currentData?.buttons["back"] || "Zpět"}</strong></span>
          </p>
        </Link>
        <div className="container login-margin-top-90 wrapper mb-4">
          <h1>VŠEOBECNÉ OBCHODNÍ PODMÍNKY</h1>
          <h3>1.	Úvodní ustanovení</h3>
          <p>1.1.	Tyto všeobecné obchodní podmínky (dále jen “VOP”) upravují práva a povinnosti mezi společností EUROMED EU TRADE s.r.o., se sídlem Jindřicha Jindřicha 2725/14, 155 00 Praha - Stodůlky, IČO: 066 02 959, zapsanou v obchodním rejstříku vedeném Městským soudem v Praze, spisová značka C 285249 (dále jen „Společnost“) a jejími zákazníky (dále jen „Zákazník“; Společnost a Zákazník dále společně jako „Smluvní strany“) při uzavírání a plnění smluv o zajištění služeb praní prádla Společností, a to ať již prádla Zákazníka, anebo prádla zapůjčeného Zákazníkovi Společností (dále jen „Smlouva“), jejímž předmětem je poskytnutí Zákazníkovi služeb Společnosti spočívajících v praní prádla (dále jen „Služby“) a případně i jeho vyzvednutí a doručení zpět Zákazníkovi.</p>
          <p>1.2.	Pro účely těchto VOP je součástí pojmu praní vždy i sušení a žehlení, které však bude aplikováno jen u věcí, u nichž je to obvyklé. V Případě zapůjčení prádla je předmětem Smlouvy i dodání zapůjčeného prádla, které bude Společnost následně pro Zákazníka prát. Zákazník se zavazuje prát zapůjčené prádlo jen u Společnosti. Zákazník je povinen zapůjčené prádlo při nevyužívání služeb praní či ukončení spolupráce vrátit Společnosti, v případě, že tak neučiní je povinen uhradit Společnosti kompenzaci dle platného Ceníku.</p>
          <p>1.3.	VOP tvoří nedílnou součást každé uzavřené Smlouvy. Aktuální verze VOP je dostupná na webových stránkách Společnosti www.pradelna1.cz. Smluvní strany mohou jednotlivá ustanovení těchto VOP změnit nebo vyloučit, avšak pouze přímým písemným ujednáním. Písemnou formou se pro účely VOP rozumí též běžná elektronická pošta.</p>
          <p>1.4.	Zákazník je právnická osoba či fyzická osoba podnikající podle zákona č. 455/1991 Sb., zákon o živnostenském podnikání (živnostenský zákon) v platném znění.</p>
          <p>1.5.	Právní vztahy neupravené v těchto VOP se řídí příslušnými ustanoveními zákona č. 89/2012 Sb., občanský zákoník v platném znění (dále jen „ObčZ”).</p>
          <h3>2.	Uživatelské webové rozhraní</h3>
          <p>2.1.	Pro zahájení spolupráce musí Zákazník nejprve zažádat o zřízení uživatelského účtu na webových stránkách Společnosti, přes které bude v souladu s čl. 3 níže činit objednávky Služeb (dále „Uživatelský účet“).</p>
          <p>2.2.	V registračním formuláři Zákazník vyplní alespoň:</p>
          <p>a)	identifikační údaje, kterými jsou:</p>
          <p>-	obchodní firma,</p>
          <p>-	IČ a DIČ,</p>
          <p>-	adresa sídla Zákazníka, a</p>
          <p>b)	kontaktní údaje, kterými jsou:</p>
          <p>-	jméno a příjmení oprávněného zástupce Zákazníka, který bude spravovat Uživatelský účet a činit za Zákazníka Objednávky,</p>
          <p>-	tel. číslo a e-mail zástupce Zákazníka, na kterých bude moci Společnost zástupce zastihnout, a</p>
          <p>-	adresa provozovny či provozoven, pokud jich má Zákazník více.</p>
          <p>Po řádném vyplnění formuláře Společnost, za předpokladu, že Zákazník splňuje veškeré podmínky, zaktivuje tomuto Uživatelský účet.</p>
          <p>2.3.	Pouze zástupce Zákazníka uvedeny v registračním formuláři je oprávněn přihlašovat se k Uživatelskému účtu a činit Objednávky.</p>
          <h3>3.	Objednání Služeb, uzavírání Smluv</h3>
          <p>3.1.	Veškeré objednávky služeb jsou primárně prováděny prostřednictvím Uživatelského účtu na webovém rozhraní, v případě výpadku je možné provést objednávku také formou e-mailu na e-mailovou adresu office@pradelna1.com (dále „Objednávka“). V případě e-mailové objednávky musí v této Zákazník uvést: (i) zda se jedná o praní anebo zapůjčení prádla, (ii) datum, kdy chce špinavé prádlo vyzvednout, v případě praní, (ii) datum, kdy chce dodat čisté prádlo a (iii) adresu provozovny, pokud nedodá prádlo Společnosti sám, a pokud dodá sám, uvede datum a čas kdy.</p>
          <p>3.2.	V případě Objednávek přes Uživatelský účet jsou Objednávky předvyplněny systémem a Zákazník vybírá pouze datum a čas vyzvednutí špinavého prádla a datum a čas vrácení/dodání čistého prádla, způsob dopravy, provozovnu a uvede odhad objemu Objednávky.</p>
          <p>3.3.	Jednotlivá smlouva je uzavřena ve chvíli potvrzení Objednávky na webovém rozhraní, anebo když Společnost odešle Zákazníkovi potvrzení o přijetí jeho Objednávky e-mailem. V případě e-mailové objednávky, pokud by Společnost neměla kapacitu na její vyřízení v čase, který Zákazník požaduje, zašle Zákazníkovi alternativní časový návrh e-mailem. V takovém případě je jednotlivá smlouva uzavřena až poté, co Zákazník potvrdí e-mailem nabídku Společnosti.</p>
          <p>3.4.	Uzavřením každé jednotlivé smlouvy vzniká v případě (i) praní - závazek Společnosti vyprat prádlo Zákazníka řádně a včas a (ii) zapůjčení – závazek Společnosti dodat čisté prádlo Zákazníkovi řádně a včas a Zákazníkovi vzniká v obou případech závazek za řádně vyprané/dodané prádlo zaplatit Společnosti úplatu v souladu s platebními podmínkami uvedenými ve VOP a platným Ceníkem.</p>
          <p>3.5.	Zákazník je povinen vyplnit do Objednávky, tj. do formuláře, veškeré požadované údaje, které musí být pravdivé a úplné, aby mohly být použity k řádnému poskytnutí Služeb ze strany Společnosti.</p>
          <h3>4.	Cena, platební podmínky</h3>
          <p>4.1.	Za poskytnutí Služeb a dopravu Společnost účtuje cenu uvedenou v aktuálním ceníku Společnosti, který je buď nahrán v Uživatelském účtu Zákazníka v sekci „dokumenty“ anebo zaslán Zákazníkovi e-mailem (dále „Ceník“), platném k okamžiku zadání Objednávky Zákazníkem. Společnost je oprávněna Ceník jednostranně změnit, v takovém případě je povinna jej před jeho změnou nahrát do Uživatelského účtu anebo jej zaslat Zákazníkovi. Nový Ceník se uplatní od data účinnosti v něm uvedeném.</p>
          <p>4.2.	Cena za poskytnuté Služby bude vypočítána dle množství určeného v souladu s čl. 5.6 níže a Ceníku platného při zadání Objednávky.</p>
          <p>4.3.	Společnost nepožaduje od Zákazníků žádnou zálohu. Fakturace za poskytnuté Služby probíhá měsíčně zpětně za Služby poskytnuté Zákazníkovi v předchozím měsíci.</p>
          <p>4.4.	Cena je hrazena Zákazníkem na základě řádného daňového dokladu (faktury) vystaveného Společností v souladu se skutečně poskytnutými službami. Splatnosti faktur činí 15 dnů ode dne jejich vystavení. Společnost přijímá pouze platby bezhotovostním převodem ve prospěch účtu uvedeného na příslušné faktuře.</p>
          <p>4.5.	Faktura vystavená Společností musí obsahovat náležitosti vyžadované právními předpisy České republiky pro daňový doklad.</p>
          <p>4.6.	V případě, že faktura nebude mít výše uvedené náležitosti či bude neúplná, je Zákazník oprávněn ji vrátit ve lhůtě splatnosti zpět Společnosti k doplnění, aniž tím bude v prodlení s její úhradou.</p>
          <p>4.7.	Vadnou či neúplnou fakturu, kterou vrátil Zákazník oprávněně Společnosti zpět, Společnost opraví a opětovně doručí Zákazníkovi. Lhůta splatnosti opravené faktury počíná běžet znovu od opětovného doručení náležitě doplněné či opravené faktury Kupujícímu.</p>
          <p>4.8.	V případě prodlení Zákazníka s úhradou faktur vzniká Společnosti nárok na úrok z prodlení ve výši 0,2 % z dlužné částky za každý den prodlení. Dále, pokud Zákazník i po e-mailové výzvě k úhradě dlužné částky, tak neučiní, a to ani do 5 dnů po jejím odeslání, Společnost pozastaví dodávku Služeb Zákazníkovi dokud jí neuhradí veškeré dlužné částky a zároveň má Společnost právo využít ustanovení § 1395 ObčZ a zadržet prádlo, které bude mít u sebe na praní až do okamžiku úplného uhrazení dlužných částek.</p>
          <h3>5.	Vyzvednutí a vrácení prádla</h3>
          <p>Mimo prostory Společnosti</p>
          <p>5.1.	Společnost zajišťuje vyzvednutí prádla Zákazníků v termínu, čase a na adrese, uvedených v potvrzené Objednávce, a jeho vrácení v určeném termínu a čase zpět na tutéž adresu, případně na jinou Zákazníkem uvedenou adresu v potvrzené Objednávce. Doprava je zpoplatněna dle platného Ceníku.</p>
          <p>5.2.	Společnost poskytuje službu vyzvednutí a vrácení prádla Zákazníkovi pouze na jeho provozovnách. Společnost nedoručuje prádlo třetím osobám.</p>
          <p>5.3.	Společnost vyzvedává a vrací prádlo Zákazníkům mimo své prostory, v pracovních dnech v čase od 6.00 do 22:00.</p>
          <p>V prostorách Společnosti</p>
          <p>5.4.	Zákazník může zvolit možnost Služeb bez dopravy, tj. že dodá prádlo sám do prostor Společnosti na adrese Pražská 355, Slaný, kde si je také může vyzvednout. Toto je možné v pracovních dnech v čase od 13:00 do 18:00. V tomto případě je Zákazník povinen dodat prádlo v termínu a čase uvedeným v Objednávce, anebo oznámit změnu nejpozději 48 hodin před uvedeným termínem, avšak i přesto si Společnost vyhrazuje možnost prodloužit dobu dokončení Služby. Pokud Zákazník neoznámí změnu nejpozději 48 hodin předem, vyhrazuje si Společnost právo Objednávku odmítnout, anebo prodloužit dobu dokončení Služby.</p>
          <p>Společná ustanovení</p>
          <p>5.5.	Zákazník může výše uvedené způsoby vyzvednutí a vrácení kombinovat, kdy požadované možnosti dopravy zvolí/uvede v Objednávce.</p>
          <p>5.6.	Při převzetí prádla od Zákazníka:</p>
          <p>a)	v provozovně Společnosti provede Společnost přepočítání prádla na kusy, kontrolu poškození a silného znečištění prádla (dále „Kontrola“);</p>
          <p>b)	na adrese určené Zákazníkem Společnost přebírané prádlo pouze vyfotí a Kontrolu provede až na své provozovně.</p>
          <p>Kontrolu provádí Společnost v obou případech do 24 hodin od převzetí prádla. V případě zjištění závady (v počtech kusů přebíraného prádla, poškození prádla či jeho silného znečištění neuvedených v Objednávce) Společnost v den provedení Kontroly informuje Zákazníka formou elektronické pošty, kde uvede zjištěné vady společně s fotografiemi a pošle oznámení o úpravě Objednávky, kde uvede skutečné množství prádla. Zákazník má poté 24 hodin na to, aby v případě, že s úpravou nesouhlasí toto rozporoval, pokud tak neučiní, změna Objednávky ze strany Společnosti se považuje za konečnou a závaznou.</p>
          <p>5.7.	Rozhodný a závazný objem Objednávky pro strany je ten, který Společnost zjistí při Kontrole čistého a suchého prádla.</p>
          <p>5.8.	Čisté prádlo dodává Společnost vždy společně s dodacím listem, kde je uvedeno množství vypraného anebo dodaného prádla. V případě vypraného prádla se v dodacím listu uvádí množství, které bylo zjištěno Společností při Kontrole.</p>
          <h3>6.	Práva a povinnosti Smluvních stran</h3>
          <p>6.1.	Společnost se kromě jiných povinností zde uvedených zavazuje:</p>
          <p>a)	bez zbytečného prodlení po jejich doručení potvrzovat e-mailové Objednávky Zákazníků,</p>
          <p>b)	vyzvednout a vrátit prádlo na určeném místě v dohodnutém termínu a čase,</p>
          <p>c)	nakládat s prádlem řádně a s odbornou péčí,</p>
          <p>d)	vrátit Zákazníkovi anebo mít prádlo připravené k vyzvednutí ve sjednaném termínu a čase.</p>
          <p>6.2.	Zákazník se zavazuje:</p>
          <p>a)	dodat Společnosti prádlo v termínu a čase uvedeném v Objednávce,</p>
          <p>b)	mít prádlo připravené k vyzvednutí v termínu, čase a adrese uvedených v Objednávce, v opačném případě uhradí Zákazník Společnosti náklady na dopravu dle Ceníku,</p>
          <p>c)	poskytnout Společnosti bez zbytečného odkladu součinnost potřebnou pro</p>
          <p>poskytnutí řádného plnění. O dobu od odeslání požadavku Společnosti na poskytnutí součinnosti Zákazníkovi do doby poskytnutí součinnosti Zákazníkem se prodlužuje doba pro vrácení,</p>
          <p>d)	vyzvednout si prádlo od Společnosti v určeném termínu a čase uvedeném v Objednávce. V případě, že z důvodu na straně Zákazníka, nedojde k vrácení, bude prádlo uloženo u Společnosti v její provozovně, kde je Zákazník povinen si je vyzvednout nejpozději do čtrnácti (14) dnů ode dne sjednaného pro vyzvednutí, nedohodnou-li se Smluvní strany jinak (dále „Náhradní vyzvednutí“). Nedojde-li k Náhradnímu vyzvednutí ani v uvedené lhůtě je Společnost povinna informovat Zákazníka o tom, že zamýšlí prádlo prodat a stanoví Zákazníkovi dodatečnou lhůtu pro další náhradní vyzvednutí v trvání čtrnácti (14) dnů (dále jen „Další náhradní vyzvednutí“). Nevyzvedne-li si Zákazník prádlo ani v Dalším náhradním termínu prádlo propadá a stává se majetkem Společnosti, která s ním může nakládat dle svého uvážení.</p>
          <h3>7.	Uplatnění vad a náhrada škody</h3>
          <p>7.1.	Zákazník je povinen si bez zbytečného odkladu po převzetí prádla od Společnosti toto prohlédnout a v případě zjištění vad, musí tyto oznámit Společnosti nejpozději do 24 hodin od převzetí prádla na emailovou adresu office@pradelna1.com. V případě, že tak Zákazník neučiní, považuje se Objednávka za řádně dodanou bez vad.</p>
          <p>7.2.	Společnost řeší reklamace do jednoho (1) dne od jejich prokazatelného přijetí. V případě oprávněnosti reklamace poskytne Společnost Zákazníkovi bezodkladně bezvadné plnění, a to do třetího (3) pracovního dne ode potvrzení oprávněnosti reklamace a opětovného převzetí reklamovaného prádla.</p>
          <p>7.3.	Společnost odpovídá za škodu způsobenou poškozením, ztrátou nebo zničením prádla. Výše náhrady škody je však omezena na nahrazení škody v rozsahu předvídatelném pro Smluvní strany v době uzavření jednotlivé smlouvy. Výše předvídatelné škody představuje částku maximálně do výše ceny příslušné Objednávky. Z náhrady škody jsou dále vyloučeny jakékoliv nároky na náhradu ušlého zisku či jakékoliv nepřímé nebo následné škody vzniklé Zákazníkovi nebo jakýmkoliv třetím osobám.</p>
          <h3>8.	Závěrečná ustanovení</h3>
          <p>8.1.	Smlouva a veškeré s ní související právní vztahy se řídí právními předpisy České republiky. Všechny spory vzniklé ze Smlouvy, které se nepodaří vyřešit smírnou cestou, budou rozhodnuty příslušným obecným soudem České republiky.</p>
          <p>8.2.	Zákazník není oprávněn k postoupení Smlouvy, její části, anebo jakékoliv své pohledávky ze Smlouvy, a to ani zčásti, na třetí osobu bez předchozího písemného souhlasu Společnosti. Zákazník není oprávněn započíst si jakékoliv své pohledávky vůči Společnosti proti pohledávkám Společnosti vůči němu.</p>
          <p>8.3.	Společnost si vyhrazuje pro případ, že se změní některé předpisy, její interní procesy související s praním prádla či jiné postupy při poskytování Služby, právo jednostranně změnit či doplnit tyto VOP. Nové znění bude uveřejněno na webových stránkách Společnosti a Společnost tuto změnu oznámí Zákazníkovi prostřednictvím emailu anebo webového rozhraní. Společnost oznámí změnu VOP nejpozději měsíc před nabytím jejich účinnosti. Pokud Zákazník do dne účinnosti změny VOP navrženou změnu písemně neodmítne, stává se pro něj nové znění závazné. Pokud Zákazník se změnou nesouhlasí, může před datem účinnosti změny s okamžitou účinností písemně vypovědět Smlouvu. Písemnou formou se rozumí zaslání e-mailu.</p>

          <div className="row mb-4 mt-3">
            <div className="col-12 col-lg-6">
              <div className="form-control" style={{width:'auto'}}>
                <a
                    href="/wp-content/uploads/vop/VOP-CZ.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="VOP-pradelna.pdf"
                >
                  <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
                  <span style={{ marginLeft: "5px" }}>{currentData?.buttons?.download || "Stáhnout"}{" "}
                    PDF{" "}{currentData?.customer.vop}</span>
                </a>
              </div>
            </div>
          </div>

        </div>
        <FooterAccount />
        <div
          className="form-control"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            width: "200px",
          }}
        >
          <a
            href="/wp-content/uploads/vop/VOP-CZ.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "#333" }}
            download="VOP-pradelna.pdf"
          >
            <FontAwesomeIcon icon={faFilePdf} className="file-uploaded" />
            <span style={{ marginLeft: "5px" }}>{currentData?.buttons?.download || "Stáhnout"}{" "}PDF</span>
          </a>
        </div>
      </>
  );
};

export default VopCz;
