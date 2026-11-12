# Koverr freebies

Four PDF lead magnets for the launch list. Each one matches one landing page and one signup trigger.

| PDF | Pages | Landing page | Trigger it answers | First win |
|---|---|---|---|---|
| `pdf/breach-email-decoder.pdf` | 6 | `/breach/` | "I got a breach email" | HIBP search + Notify me, 5 min |
| `pdf/home-address-takedown.pdf` | 7 | `/home-address/` | "My address is on Google" | Search yourself like a stranger, 20 min |
| `pdf/scam-call-tracer.pdf` | 6 | `/scam-calls/` | "How did they get my number?" | Spam filter + SIM PIN, 7 min |
| `pdf/exposure-snapshot.pdf` | 9 | `/` and `/leak-map/` | "How exposed am I?" | Score six paths, pick 3 fixes |

The research behind the choice is in [research-dossier.md](research-dossier.md). It explains why there is no standalone AI prompt pack: the panel agreed it is commodity content, and off-brand because it teaches people to paste personal data into chatbots. The five prompts that need no private data are in the exposure snapshot instead.

## Edit and rebuild

- Content is in `src/*.html`; the shared print style is `src/koverr-print.css`.
- Set the launch-list address and check dates once, in `src/site.js`.
- Rebuild all four with Chrome, then rebuild one by name:

```sh
bash freebies/build.sh
bash freebies/build.sh scam-call-tracer
```

Recheck every link and rule before the date in `site.js`. Laws and settings menus in this area change several times a year.

## How to use them (from the research)

1. **Deliver after signup.** Show an instant download on the confirmation screen, and send the same link in the welcome email.
2. **Route by trigger.** Each campaign page offers its own PDF. The worry question already asked after signup can pick the PDF for homepage signups.
3. **Measure activation, not just signups.** On day 3, send one email: "Did you do step 1?" Replies are the signal.
4. **Use the dates.** Every PDF says when it was checked and when to recheck. The recheck email is a natural second touch, and it previews the watch plan.
5. **No affiliate links, and no fear-only headlines.** Name the trigger and pair it with the fix.
