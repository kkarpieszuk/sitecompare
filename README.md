# SiteCompare

Narzędzie CLI do automatycznego porównywania zrzutów ekranu stron internetowych.

## Opis

SiteCompare to aplikacja wiersza poleceń, która:
- Wykonuje zrzuty ekranu stron internetowych z pliku konfiguracyjnego
- Zapisuje je w katalogu `~/.sitecompare/`
- Porównuje nowe zrzuty z wcześniejszymi wersjami
- Wykrywa zmiany wizualne z progiem tolerancji 5%
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

1. **Pierwszy uruchomienie dla URL**: Aplikacja wykonuje zrzut ekranu i zapisuje go jako `{hash}-{data}.png`
2. **Kolejne uruchomienia**: 
   - Wykonuje nowy zrzut ekranu
   - Porównuje go z najnowszym istniejącym zrzutem
   - Oblicza różnicę wizualną w procentach
   - Jeśli różnica < 5%: uznaje za identyczne
   - Jeśli różnica ≥ 5%: wykrywa zmiany

## Struktura katalogów

Zrzuty ekranu są zapisywane w:
```
~/.sitecompare/
├── abc123def456-2024-01-15.png
├── abc123def456-2024-01-16.png
├── 789ghi012jkl-2024-01-15.png
└── ...
```

Format nazwy pliku: `{hash_url}-{YYYY-MM-DD}.png`

## Raport

Po przetworzeniu wszystkich URL-i aplikacja generuje raport zawierający:

### 📸 Nowe zrzuty ekranu
URL-e, dla których nie było wcześniejszych zrzutów ekranu

### ✅ Bez zmian
URL-e, których zmiany wizualne są poniżej progu 5%

### 🔴 Wykryto zmiany
URL-e ze znaczącymi zmianami wizualnymi (≥ 5%), wraz ze ścieżkami do obu plików (poprzedniego i aktualnego)

## Przykład raportu

```
================================================================================
RAPORT PORÓWNANIA ZRZUTÓW EKRANU
================================================================================

📸 NOWE ZRZUTY EKRANU:
--------------------------------------------------------------------------------
1. https://example.com
   Zapisano: /home/user/.sitecompare/abc123def456-2024-01-15.png

✅ BEZ ZMIAN (różnica < 5%):
--------------------------------------------------------------------------------
1. https://example2.com
   Różnica: 0.12%
   Aktualny: /home/user/.sitecompare/789ghi012jkl-2024-01-15.png

🔴 WYKRYTO ZMIANY (różnica ≥ 5%):
--------------------------------------------------------------------------------
1. https://github.com
   Różnica: 15.34%
   Poprzedni: /home/user/.sitecompare/mno345pqr678-2024-01-14.png
   Aktualny:  /home/user/.sitecompare/mno345pqr678-2024-01-15.png

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

- **puppeteer**: Wykonywanie zrzutów ekranu stron
- **pixelmatch**: Porównywanie obrazów na poziomie pikseli
- **pngjs**: Obsługa plików PNG

## Obsługa błędów

Aplikacja obsługuje:
- Nieprawidłowe lub brakujące pliki konfiguracyjne
- Błędy sieciowe podczas ładowania stron
- Nieprawidłowe URL-e
- Błędy zapisu plików

## Licencja

MIT
