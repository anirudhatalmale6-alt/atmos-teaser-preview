# Beta registry landing page

A single, self-contained squeeze page. Three files, no build step, no framework,
no dependencies. Upload the folder to your host and it works.

```
index.html    all the copy
styles.css    all the colours, spacing and layout
main.js       the countdown, the trailer and the form (one CONFIG block at the top)
```

---

## Preview build — read this first

What is on screen now is a **preview**, not a finished page. Deliberately:

* Every black bar (`▬▬▬`) marks a fact only you can give me — the game name,
  the launch date, what a player actually does, the price after beta.
  Hover any bar and the tooltip says what belongs there.
* All headline and FAQ copy is a **draft**. Replace freely.
* The form has **no `action` and no `name` attributes**, so it cannot send
  anything anywhere. It is switched on by one line — see below.
* The page carries `noindex` and a yellow "preview build" bar at the top.
  Both are deleted at launch (instructions below).

---

## Going live — the four things to change

### 1. Connect Mailchimp

In Mailchimp: **Audience → Signup forms → Embedded form**. Copy the URL out of
the `<form action="...">` line. It looks like:

```
https://yourname.us21.list-manage.com/subscribe/post?u=abc123def456&id=789xyz
```

Paste it into `main.js`:

```js
mailchimp: { postUrl: "https://yourname.us21.list-manage.com/subscribe/post?u=abc123def456&id=789xyz" },
```

That is the whole integration. The page subscribes people **without sending
them off to a Mailchimp page** — they stay where they are and see a confirmation
line under the form. "Already subscribed" is handled as a friendly message, not
an error.

*Prefer something else?* ConvertKit, Beehiiv, Buttondown and MailerLite all work
the same way — tell me which and I'll swap the one function over.

### 2. Set the countdown date

`main.js`:

```js
launchISO: "2026-10-15T18:00:00Z",   // UTC
// or with a timezone offset:
launchISO: "2026-10-15T18:00:00+01:00",
```

Set it to `""` and the countdown block disappears cleanly. If the date passes,
the page says the date has passed instead of showing a frozen `00 00 00 00`.

### 3. Add the trailer

`main.js`:

```js
trailer: { provider: "youtube", id: "dQw4w9WgXcQ" },   // youtu.be/dQw4w9WgXcQ
trailer: { provider: "vimeo",   id: "123456789" },     // vimeo.com/123456789
trailer: { provider: "file",    id: "teaser.mp4" },    // a file next to index.html
```

The video is **click-to-load** — nothing downloads until a visitor presses play,
which is most of why this page is fast.

### 4. Remove the preview scaffolding

* Delete the `<div class="demo-bar">…</div>` block near the top of `index.html`.
* Delete the `<meta name="robots" content="noindex, nofollow">` line so Google
  can index you.
* Delete the `<p class="draft-chip">draft copy — yours replaces it</p>` line.

---

## Editing copy

Everything a visitor reads is plain text in `index.html`, in the order it appears
on screen. Find the words on the page, search for them in the file, type over
them. Sections are signposted with comments:

```html
<!-- ================= HERO ================= -->
<!-- ================= OPT-IN FORM ================= -->
<!-- ================= TRAILER ================= -->
<!-- ================= FAQ ================= -->
```

**Adding an FAQ item** — copy one whole `<details class="qa">…</details>` block
and edit it. Remove `open` from the first one if you'd rather they all start closed.

**Replacing a black bar** — delete the `<i class="rd …"></i>` tag and type your
text in its place.

---

## Editing the look

All of it lives in the `:root` block at the top of `styles.css`:

```css
--gold:  #d3a94f;   /* every accent: buttons, rules, numbers */
--teal:  #4fb6a8;   /* the small "success" green             */
--ink:   #070a0d;   /* page background                       */
--panel: #101720;   /* the cards                             */
```

Change `--gold` alone and the whole page re-themes. Fonts are two Google
families set in `--serif` and `--mono`.

To swap the atmosphere for your own key art, put an image behind the hero:

```css
.hero{ background:url("hero.jpg") center/cover no-repeat; }
```

…and darken it with the existing `.vault-light` overlay still on top.

---

## Hosting

Upload `index.html`, `styles.css` and `main.js` to your web root. That's it —
no PHP, no database, no Node. It works on any host, including a plain S3 bucket
or GitHub Pages.

Two things worth doing on your host:

* Force HTTPS (browsers now warn on any form served over plain HTTP).
* Leave caching at your host's default; the page is small enough that it
  doesn't matter much.

---

## What it does for conversions

* One goal per screen — the email field is the only thing above the fold that
  can be clicked apart from the two nav links.
* The form appears twice (hero, and the closing block) plus a header button.
* Click-to-load video: the page paints before the visitor decides to leave.
* The FAQ answers the two objections that actually cost signups —
  *what is this* and *when do I get in* — right next to a repeated CTA.
* Countdown is optional and quiet by design; a loud one reads as a gimmick and
  costs trust on a page asking for an email.

---

## Accessibility & compatibility

* Works with JavaScript disabled (content is all visible; only the countdown,
  the video and the inline form response need JS).
* Respects `prefers-reduced-motion` — every animation stops.
* Keyboard navigable, visible focus rings, labelled form field, live-region
  status message.
* Tested at 390px, 768px, 1280px and 1600px wide.
