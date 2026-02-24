# Aplikace na kurzovní lístky

Postupy byly prováděny a zkoušeny na Windows 11, nejsem schopný zarušit stejnou podobu na Linux distribucích.

## Jak spustit

### Kompletní spuštění pomocí dockeru

- Mít nainstalovaný a funkční Docker (desktop)
1. Naklonovat si repozitář
2. Nahradit ```.env``` a ```.env.local``` soubory těmi, které přišly jako příloha emailu s oznámením konce implementace
3. Ve složce 1pfKurzovniListky otevřít příkazovou řádku a spustit kontejnery příkazem ```docker compose up --build```
4. Frontend běží na ```http://localhost:5173/```
5. Backend běží na ```http://localhost:8080/api/exchange-rates```

### Spuštění JAR balíčku

Endpoint vyžaduje env proměnné a běžící databázi. Kvůli běhu mimo kontejner je třeba pozměnit URL databáze - správná verze se nachází v souboru ```.env.local```, který přišel emailem.

- Mít nainstalovaný a funkční Docker (desktop)
1. Naklonovat si repozitář
2. Nahradit ```.env``` a ```.env.local``` soubory těmi, které přišly jako příloha emailu s oznámením konce implementace
3. Ve složce 1pfKurzovniListky otevřít příkazovou řádku a spustit databázi příkazem ```docker compose up --build db```
4. Ve složce 1pfKurzovniListky otevřít **Powershell** a spustit endpoint s env proměnnými příkazem: (Pardon za míchání cmd a powershell, tohle v cmd jde o hodně hůř)
```
Get-Content .env.local |
  Where-Object { $_ -and $_ -notmatch '^#' } |
  ForEach-Object {
    $name, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($name, $value)
  }
java -jar rest_endpoint-0.0.1-SNAPSHOT.jar
```
5. Endpoint běží na ```http://localhost:8080/api/exchange-rates```

## Frontend 1

Verze s čistým frontendem se nachází v commitu [f352c3f](https://github.com/defDejf/1pfKurzovniListky/commit/f352c3f2a82a5e8450c006e5611ad31f86eea564).
Jedná se o React + Vite applikaci se dvěma stages: Přehled (index.html/jsx) a Detail (detail.html/jsx). Hrubý nástřel grafického návrhu byl vytvořen pomocí Google nástroje Stitch.
Html kostry byly napsány se snahou co nejvíce dodržet sémantickou správnost a validitu. Stránky byly validovány pomocí nástroje (w3org)[https://validator.w3.org/nu].
Odesílání requestů je realizováno pomocí ```fetch()```.

### Přehled

Zde se vykresluje seznam všech měn z odpovědi dodaného API. Na měnu je možné kliknout pro zobrazení jejího detailu. 
Pro omezení zbytečných API volání je využit session storage jako cache s validitou 5 minut. Dá se předpokládat, 
že by uživatel chtěl zobrazit více měn v krátkém sledu a takto se sníží zátěž sítě a případné poplatky za API (kdyby se jednalo o placené).
Primárně se využívá cache, pokud data nejsou nebo expirovala, je poslán request na endpoint.

Přehled poskytuje několik typu řazení, při vybrání nové hodnoty v jednom z výběrových seznamů dojde k změně pořadí a díky useState seřazení persistuje i obnovení záložky.

### Detail

Zobrazuje kompletní informace o kurzu, nejprve hledá v session storage, pokud nenajde, pošle request na API, ale s query parametrem ```curr```, 
který zajistí vrácení pouze konkrétní měny. Toto také zajišťuje, že je možné skrz URL přistoupit rovnou na konkrétní detail měny, aniž by v minulosti došlo k volání plného API a naplnění session storage.

## Backend

Springboot aplikace poskytující jeden GET endpoint  ```/api/exchange-rates```. 

### Návrh

Snaha o dodržení standardní vícevrstvé architektury.

#### API vrstva

ExchangeRateController - přijímá požadavky, odesílá odpovědi. Zde částečně porušena vrstva, exception handling by měla řešit servisní vrstva.
Endpoint přijímá 2 nepovinné parametry, ```curr``` a ```usedb``` (default = true).
Pomocí ```curr``` je možné omezit odpověď na pouze jednu měnu, replikuje tak chování původního endpointu. 
Pomocí ```usedb``` se ovládá, zda dojde k obnově databáze před odesláním odpovědi. Pokud je nastaveno na ```false```, pak endpoint pomocí třídy ```CsasApiConnector``` odešle GET request na api.

#### Servisní vrstva

ExchangeRateService - Poskytuje zpracovaná data kontroleru, zajišťuje filtrování, obnovu dat, interaguje s integrační vrstvou.

#### Data access vrstva

ExchangeRateRepository - Poskytuje přístup do databáze. Založeno na ```JpaRepository``` pro jednoduchou persistenci entit.
V případě rozsáhlejšího projektu by bylo třeba přidat DAO pro snížení couplingu se servisní vrstvou.

#### Integrační vrstva

Volá externí API, poskytuje servisní vrstvě DTO, která jsou pak ukládána do databáze (v našem případě téměř shodné s ```ExchangeRate``` entitou).
V případě rozšíření služeb by bylo vhodné vytvořit předka pro externí API connectory pro zajištění polymorfismu a jednoduchého rozšiřování.

### Co by se dalo zlepšit

1. Exception handling - pouze jednoduchý try/catch v controlleru, Spring poskytuje přímo annotaci ```@ExceptionHandler```, pro projekt tohoto rozsahu jsem nekonfiguroval.
2. Logging - v kódu bylo ponecháno jen minimum ```System.out.println()``` pro jednodušší debugging, v reálné implementaci by bylo třeba použít loggovací framework.
3. Security nastavení - pro vyřešení problémů s CORS byla k třídě ```ExchangeRateController``` přidána anotace ```@CrossOrigin(....)``` - v implementaci s např více endpointy by bylo vhodnější použít centrální nastavení.

## Frontend 2

Principielně shodný s prvním FE, navíc poskytuje tlačítko ```Obnovit data```, které po stisknutí odešle request na náš endpoint s parametrem ```usedb=false``` a zajistí tak načtení nejnovějších dat.
Zůstává i možnost používat původní externí API, stačí v ```.env``` souboru nastavit ```useLocalEndpoint=false``` a požadavky se budou odesílat na API Csas.
Při této možnosti mizí tlačítko ```Obnovit data``` - externí API parametr ```usedb``` nepřijímá.
