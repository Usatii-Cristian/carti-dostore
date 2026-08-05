import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { SearchBar } from "./SearchBar";
import { SecondaryNav } from "./SecondaryNav";

/**
 * La scroll 0 se vede tot antetul. Cum cobori, bara de contact și cea cu
 * logo/căutare/coș pleacă odată cu pagina și rămâne lipită doar bara de
 * navigație (navy) — antetul ocupa altfel prea mult din ecran.
 *
 * E făcut din `position: sticky`, fără JavaScript și fără ascultător de scroll:
 * elementele care trebuie să dispară pur și simplu nu sunt sticky. De-asta NU
 * sunt învelite toate într-un `<header>` comun — un părinte comun ar limita
 * elementul sticky la înălțimea lui, iar bara de navigație s-ar desprinde din
 * vârf de îndată ce antetul iese din ecran.
 *
 * Pe telefon bara de navigație e ascunsă (`hidden md:block`), deci acolo rămâne
 * lipită bara cu logo/căutare/coș — altfel n-ar mai fi nimic la îndemână.
 */
export function Header() {
  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-40 md:static md:z-auto">
        <MainHeader />
      </header>

      {/* Căutarea, pe telefon: rând propriu, în afara părții lipite — pleacă
          odată cu pagina, ca bara rămasă pe ecran să fie una singură. */}
      <div className="border-b border-border bg-cream px-4 py-3 sm:hidden">
        <SearchBar />
      </div>

      <SecondaryNav />
    </>
  );
}
