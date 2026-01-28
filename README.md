# SiteCompare

Narzędzie CLI do automatycznego porównywania zrzutów ekranu stron internetowych.

## Opis

SiteCompare to aplikacja wiersza poleceń, która:
- Wykonuje zrzuty ekranu stron internetowych z pliku konfiguracyjnego
- Zapisuje kod HTML stron wraz ze zrzutami
- Zapisuje wszystko w katalogu `~/.sitecompare/`
- Porównuje nowe zrzuty i HTML z wcześniejszymi wersjami
- Wykrywa zmiany wizualne (obrazy) i strukturalne (HTML) z progiem tolerancji 5%
- Generuje szczegółowy raport zmian

## Instalacja

```bash
cd /path/to/sitecompare
npm install
```

Aby zainstalować globalnie:

```bash
npm install -g .
```

Lub użyj lokalnie bez instalacji globalnej:

```bash
npm link
```

## Użycie

### Podstawowe użycie

```bash
sitecompare conf.json
```

### Użycie z domyślnym plikiem konfiguracyjnym

Jeśli w bieżącym katalogu znajduje się plik `sitecompare.json`, możesz uruchomić aplikację bez podawania ścieżki:

```bash
sitecompare
```

### Format pliku konfiguracyjnego

Plik konfiguracyjny musi być w formacie JSON i zawierać tablicę `urls`:

```json
{
  "urls": [
    "https://example.com",
    "https://example2.com",
    "https://github.com"
  ]
}
```

## Jak to działa

1. **Pierwszy uruchomienie dla URL**:
   - Aplikacja łączy się ze stroną i czeka 6 sekund na załadowanie dynamicznych elementów (cookie banners, lazy loading, itp.)
   - Wykonuje zrzut ekranu i zapisuje go jako `{domena}-{hash}-{data-czas}.png`
   - Zapisuje kod HTML jako `{domena}-{hash}-{data-czas}.html`
2. **Kolejne uruchomienia**:
   - Łączy się ze stroną i czeka 6 sekund
   - Wykonuje nowy zrzut ekranu i pobiera HTML
   - Porównuje obraz z najnowszym istniejącym zrzutem (pixel-by-pixel)
   - Porównuje HTML z poprzednią wersją (line-by-line diff)
   - Oblicza różnicę w procentach dla obu
   - Jeśli różnica < 5%: uznaje za identyczne
   - Jeśli różnica ≥ 5%: wykrywa zmiany (w obrazie i/lub HTML)

## Struktura katalogów

Zrzuty ekranu i pliki HTML są zapisywane w:
```
~/.sitecompare/
├── example_com-abc123def456-2024-01-15-14-30-45.png
├── example_com-abc123def456-2024-01-15-14-30-45.html
├── example_com-abc123def456-2024-01-15-14-35-22.png
├── example_com-abc123def456-2024-01-15-14-35-22.html
├── github_com-789ghi012jkl-2024-01-15-15-00-00.png
├── github_com-789ghi012jkl-2024-01-15-15-00-00.html
└── ...
```

Format nazwy pliku: `{domena}-{hash_url}-{YYYY-MM-DD-HH-MM-SS}.{rozszerzenie}`

Gdzie:
- `{domena}` - główna domena z URL (kropki zamienione na podkreślniki)
- `{hash_url}` - hash SHA256 całego URL (pierwsze 16 znaków)
- `{YYYY-MM-DD-HH-MM-SS}` - data i godzina wykonania zrzutu
- `{rozszerzenie}` - `png` dla obrazów, `html` dla kodu źródłowego

## Raport

Po przetworzeniu wszystkich URL-i aplikacja generuje raport zawierający:

### 📸 Nowe zrzuty
URL-e, dla których nie było wcześniejszych zrzutów - pokazuje ścieżki do nowych plików PNG i HTML

### ✅ Bez zmian
URL-e, których zmiany wizualne (obraz) i strukturalne (HTML) są poniżej progu 5%

### 🔴 Wykryto zmiany
URL-e ze znaczącymi zmianami (≥ 5%) w obrazie i/lub HTML, wraz ze ścieżkami do wszystkich plików (poprzednich i aktualnych)

## Przykład raportu

```
================================================================================
RAPORT PORÓWNANIA ZRZUTÓW EKRANU
================================================================================

📸 NOWE ZRZUTY:
--------------------------------------------------------------------------------
1. https://example.com
   Obraz: /home/user/.sitecompare/example_com-abc123def456-2024-01-15-14-30-45.png
   HTML:  /home/user/.sitecompare/example_com-abc123def456-2024-01-15-14-30-45.html

✅ BEZ ZMIAN (różnica < 5%):
--------------------------------------------------------------------------------
1. https://example2.com
   Różnica obrazu: 0.12%
   Różnica HTML:   0.05%
   Aktualny obraz: /home/user/.sitecompare/example2_com-789ghi012jkl-2024-01-15-14-35-22.png
   Aktualny HTML:  /home/user/.sitecompare/example2_com-789ghi012jkl-2024-01-15-14-35-22.html

🔴 WYKRYTO ZMIANY (różnica ≥ 5%):
--------------------------------------------------------------------------------
1. https://github.com
   Zmiany: Obraz: 15.34%, HTML: 8.45%
   Poprzedni obraz: /home/user/.sitecompare/github_com-mno345pqr678-2024-01-14-10-00-00.png
   Aktualny obraz:  /home/user/.sitecompare/github_com-mno345pqr678-2024-01-15-15-00-00.png
   Poprzedni HTML:  /home/user/.sitecompare/github_com-mno345pqr678-2024-01-14-10-00-00.html
   Aktualny HTML:   /home/user/.sitecompare/github_com-mno345pqr678-2024-01-15-15-00-00.html

================================================================================
PODSUMOWANIE:
  Nowe zrzuty:        1
  Bez zmian:          1
  Ze zmianami:        1
  Razem przetworzono: 3
================================================================================
```

## Wymagania

- Node.js (wersja 14 lub nowsza)
- npm

## Zależności

- **puppeteer**: Wykonywanie zrzutów ekranu stron i pobieranie HTML
- **pixelmatch**: Porównywanie obrazów na poziomie pikseli
- **pngjs**: Obsługa plików PNG
- **diff**: Porównywanie plików HTML line-by-line

## Obsługa błędów

Aplikacja obsługuje:
- Nieprawidłowe lub brakujące pliki konfiguracyjne
- Błędy sieciowe podczas ładowania stron
- Nieprawidłowe URL-e
- Błędy zapisu plików

## Licencja

MIT
