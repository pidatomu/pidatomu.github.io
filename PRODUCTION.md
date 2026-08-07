# Production Checklist — Pidatomu

Pre-deployment checklist sebelum launch public.

---

## Environment Variables

Pastikan semua env vars sudah di-set di production:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers (pilih minimal 1)
GROQ_API_KEY=
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://pidatomu.vercel.app
```

---

## Rate Limiting

| Tier | Limit/Hari | Catatan |
|------|-----------|---------|
| Guest | 5 | Per device ID |
| User (login) | 15 | Per auth UID |

Pastikan Supabase RPC `increment_rate_limit` sudah dibuat dan berfungsi.

---

## Supabase Setup

- [ ] Tabel `speeches` sudah ada
- [ ] Tabel `rate_limits` sudah ada
- [ ] RPC `increment_rate_limit` sudah dibuat
- [ ] RLS policies sudah dikonfigurasi
- [ ] Storage bucket untuk file (kalau ada) sudah ready

---

## AI Provider

- [ ] Groq API key valid & ada quota
- [ ] Gemini API key valid & ada quota
- [ ] Fallback handler sudah diuji (provider 1 down → provider 2)

---

## PWA / Manifest

- [ ] `public/manifest.json` sudah ada
- [ ] Icon 192x192 & 512x512 sudah ada (belum dibuat — perlu generate)
- [ ] `theme_color` & `background_color` sesuai

---

## Build & Deploy

- [ ] `npm run build` clean (0 errors, 0 warnings)
- [ ] `npm run lint` clean
- [ ] Tidak ada `console.log` yang ketinggalan di production code
- [ ] Tidak ada API keys yang hardcoded

---

## Performance

- [ ] Image optimization (kalau ada gambar)
- [ ] Font loading: `Space Grotesk` + `Inter` sudah ter-load
- [ ] Streaming response berfungsi baik
- [ ] Tidak ada memory leak di WebSocket / EventSource

---

## Security

- [ ] `SUPABASE_SERVICE_ROLE_KEY` hanya di server-side (tidak di client)
- [ ] API routes tidak expose sensitive data
- [ ] CORS sudah dikonfigurasi (kalau perlu)
- [ ] CSP headers sudah dipertimbangkan

---

## Monitoring

- [ ] Error logging (Vercel Analytics / Sentry)
- [ ] Rate limit monitoring
- [ ] AI provider usage/cost monitoring

---

## Post-Deploy

- [ ] Test generate naskah dari homepage
- [ ] Test export DOCX
- [ ] Test export PDF
- [ ] Test share link
- [ ] Test dark mode
- [ ] Test mobile responsive
- [ ] Test keyboard shortcuts
- [ ] Test version history
- [ ] Test template library
- [ ] Test voice preview (TTS)

---

## Known TODO (Before Public Launch)

1. **Generate icon 192x192 & 512x512** untuk PWA manifest
2. **Supabase RPC** `increment_rate_limit` pastikan sudah deployed
3. **Analytics** — pertimbangkan Vercel Analytics atau Plausible
4. **Error tracking** — pertimbangkan Sentry
5. **SEO** — meta tags, Open Graph, structured data
6. **Landing page** — bisa pertimbangkan dedicated landing page
