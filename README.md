# DevOps akademija - Web development - Izposojevalnica

**Demo aplikacija** tečaja **Web development** v okviru **DevOps akademije** by Jurij Cvikl.

Genovefa ima doma kar precej veliko in zanimivo zbirko knjig. Kljub pojavu raznoraznih elektronskih bralnikov pa meni, da je ima papir še vedno svoj čar, pa pod mizo lažje podložiš knjigo kot pa Kindle. Genovefino zbirko knjig cenijo tudi njeni prijatelji, saj na ta način pridejo do prodajnih uspešnic prej kot v knjižnici. Žal pa si Genovefa bistveno bolje zapomni vsebino knjig kot pa osebo, ki si je neko knjigo izposodila.

Pomagajte ji iz zagate s spletno aplikacijo, ki bo še najbolj spominjala na knjižnico. Aplikacija naj omogoča vnos nove knjige (vsaka knjiga naj pri vnosu dobi svojo unikatno številko), lahko celo omogočite izpis nalepke oz. kartončka za posamezno knjigo.

Poleg tega naj aplikacija omogoča tudi beleženje evidence o izposoji (torej, kdo si je izposodil katero knjigo in kdaj). Zgodovina izposoj za posamezno knjigo naj se ohranja.

Genovefinim prijateljem pa omogočite iskanje po njeni zbirki knjig in pregled statusov (ali je posamezna knjiga izposojena ali ne).

Aplikacija naj ponuja tudi izpis različnih statistik (kdo si največkrat izposodi knjigo, kdo ima trenutno največ izposojenih knjig, …).

Aplikacija naj bo napisana tako, da bo omogočala tudi izposojo drugih reči (npr. CD-jev, orodja, …)


# Aplikacija omogoča:
- registracijo in prijavo uporabnikov
- prijavljeni uporabniki lahko:
  - dodajajo svoje tipe predmetov, ki jih želijo posojati
  - dodajajo svoje predmete za posojo
  - posojajo in vračajo svoje predmete
  - si ogledajo njihovo trenutno izposojo
  - gledajo poročila o svoji izposoji
  - prebirajo katalog, iščejo po njem in si izposojajo predmete
- neprijavljenih uporabniki lahko:
  - prebirajo katalog, iščejo po njem in si izposojajo predmete

# How to use app
1. run `cp .env.example .env` to create config file
2. run `docker-composer up`
3. open `http://localhost:3000` in browser
4. in order to fill test data, run `npm run import:db-docker`

# Test user data
- Email: jurij@marcelino.si, Password: jure20
- Email: some@user.com, Password: some20