# HydraClip mobile app

The companion app for HydraClip, a wearable hydration sensor for nurses, designed to be PPE-safe and hygienic. The clip
was meant to read hydration through a shift and remind the nurse to drink. This app shows the readings, the trend and a
daily goal.

**Status: paused.** The app got as far as working screens on simulated data. No sensor was ever connected: every reading
in it comes from `Math.random()`.

HydraClip won the Audience Choice Award at Pitch Battles and was one of 9 ventures picked from 42 for the Panther Pitch
final. Case study: [ditthichatterjee.com/work/hydraclip](https://ditthichatterjee.com/work/hydraclip)

## Team

A team of four. I was Chief Technology Officer.

- Hadiqa Sulman, CEO
- Mary Ejairu, COO and clinical advisor
- Yuan Cui, CPO
- Ditthi Chatterjee, CTO

The organisation dashboard is in [hydraclip-dashboard](https://github.com/ninichatterjee/hydraclip-dashboard).

## What is in this repo

| Folder | What it is |
|---|---|
| `mobile-app/` | The Expo / React Native app. This is the main thing. |
| `Frontend/` | An earlier Next.js mock of the same phone screen, started from a v0 template, with a button that inserts a random reading. |

The `package.json` at the root is left over and not needed to run either one.

## What the app does

- Sign-up and sign-in with email and password through Supabase Auth. The session is kept in AsyncStorage.
- **Home:** the latest hydration score and its status (hydrated at 70% and up, dehydrating from 40%, alert below 40%),
  a chart of the last seven readings, and a short projection. The projection fits a least-squares line through the
  last five readings and extends it three steps. It is arithmetic, not a model.
- **Simulated readings:** while the app is open, a timer writes a random reading to Supabase every 20 minutes, standing
  in for the clip. The interval can be changed in Settings.
- **History:** today's readings, with a count and the daily average.
- **Goal:** progress toward a daily hydration goal, stored per user.
- **Settings:** the goal, the reading interval, the user's hospital, and sign-out. The reminder-mode and notification
  controls are UI only and do not do anything yet.

## Stack

TypeScript, React Native 0.81, Expo SDK 54, React Navigation (bottom tabs), react-native-chart-kit, Supabase (Auth and
Postgres).

## Running it

You need Node and either Expo Go on a phone or an iOS or Android simulator.

```bash
cd mobile-app
npm ci
npx expo start
```

The Supabase URL and publishable key are written into `mobile-app/lib/supabase.ts`. The original Supabase project is no
longer online, so to see data you need your own project with these tables. There are no migrations in the repo; the
columns below are read off the queries.

| Table | Columns used |
|---|---|
| `hydration_logs` | `id`, `created_at`, `hydration_level` (0 to 1), `nurse_id` (text), `user_id` (uuid, nullable) |
| `profiles` | `id` (the auth user's id), `hydration_goal` (0 to 1), a foreign key to `hospitals` |
| `hospitals` | `id`, `name` |

Each signed-in user sees only their own rows, matched on `user_id`.

To run the older web mock instead: `cd Frontend`, `npm ci`, set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in `.env.local`, then `npm run dev`.
