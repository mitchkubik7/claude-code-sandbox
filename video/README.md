# AuthentIQ promo video

60-second 1080p motion graphics ad for AuthentIQ (done-for-you podcast production). The goal is to get viewers to **book a discovery call**.

**Final render:** [`out/AuthentIQ-Promo-1080p.mp4`](out/AuthentIQ-Promo-1080p.mp4) (H.264 + AAC, 30fps, -14.8 LUFS)

## Storyboard

| Time | Scene | Message |
|---|---|---|
| 0–6s | Hook | "You started a podcast to grow your business. Not to spend your weekends ~~editing it~~." |
| 6–14s | Pain | Post-production tasks pile up, then "Every. Single. Episode." |
| 14–20s | Reveal | AuthentIQ logo: "Done-for-you podcast production. You record. We handle everything after." |
| 20–34s | How it works | 01 You hit record → 02 We handle everything after → 03 Your show goes live everywhere |
| 34–44s | What's included | Editing, short-form clips, captions, show notes, publishing, scheduling |
| 44–50s | Outcome | "You focus on the conversation. We make sure it gets heard." |
| 50–54s | Scarcity | "We only take on 10 shows at a time." |
| 54–60s | CTA | "Book your discovery call" + authentiqmarketing.com |

## How it's built

- **[Remotion](https://www.remotion.dev/)** (React → frame-accurate video). Each scene lives in `src/scenes/`. Shared motion primitives are in `src/components.tsx`, and brand colors are in `src/theme.ts`.
- **`src/timing.json`** is the single source of truth for scene boundaries and SFX cue frames. Both the visuals and the soundtrack read it, so the hits stay locked to the cuts.
- **Soundtrack**: an original track synthesized in `audio/make_soundtrack.py` (numpy/scipy, 120 BPM, Am–F–C–G). It is royalty-free because no samples were used.
- **Fonts**: Space Grotesk + Inter (Google Fonts, OFL), vendored in `public/fonts/`.

## Commands

```bash
npm install
npm run soundtrack   # writes public/soundtrack.wav (needs python3 + numpy + scipy)
npm run studio       # live preview / scrub timeline in the browser
npm run render       # renders out/AuthentIQ-Promo-1080p.mp4
```

`remotion.config.ts` points at the Chromium headless shell that is preinstalled in Claude Code cloud sessions. On a local machine, delete the `setBrowserExecutable` line.

## Common edits

- **Brand colors**: `C` in `src/theme.ts`.
- **Copy**: the text is inline in each scene file.
- **Logo**: replace `LogoMark`/`Wordmark` in `src/components.tsx` with an `<Img src={staticFile("logo.svg")} />`.
- **Timing**: change `src/timing.json`, then re-run `npm run soundtrack` so the SFX follow.
