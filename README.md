# Petify

A Petify egy Next.js és Supabase alapú zenelejátszó webalkalmazás.

## Fő funkciók

- dalok listázása
- keresés
- kedvelt zenék kezelése
- feltöltés
- Supabase alapú autentikáció

## Használt technológiák

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase

## Telepítés

```bash
git clone https://github.com/BgtPtr/Szakdolgozat.git
cd petify
npm install
```

## Környezeti változók

Hozz létre egy `.env.local` fájlt:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Futtatás fejlesztői módban

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

## Adatbázis

A szükséges adatbázis-struktúra a `supabase.sql` fájlban található.


## Szerző

Készítette: Bogáthy Péter
