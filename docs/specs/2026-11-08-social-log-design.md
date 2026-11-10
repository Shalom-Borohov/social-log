# מפגשים — Social Meetup Log PWA Design

Personal iPhone PWA for logging meetups with friends: who, when, where, how long and how it went. The main screen is a rolling calendar coloured by how each day's meetups went, a second tab shows friends in an orbit by how long since you last met, and a meetup is logged by filling in a sentence. Sibling of תפילות (`~/Personal/prayer-log`). Design canvas: https://claude.ai/artifact/Rj6WfdddijRwGoLbbhtWsh (page "Your combination", row "New colours", logging look A).

## Decisions (from grilling, 2026-11-08)

1. **Name:** מפגשים (changed 2026-11-10 from נפגשנו). Repo and folder: `social-log` (the user kept it over `friends-log`). Why: a plain plural of what is logged, like the sibling apps אימונים and תפילות, and the word the app already uses for a meetup.
2. **Layout:** two tabs, לוח שנה (main) · חברים, plus a round + button beside them that opens the logging sentence. Why: the user wants their rhythm first and who they're drifting from second.
3. **Groups:** saved groups are shortcuts that fill in their members; a meetup always records the people who actually came, and the group is remembered only for wording the sentence. Orbit is per person. Why: Orbit can then say "you haven't seen Itay alone", and absent members don't look present.
4. **Rating:** required, one tap, four levels: מעולה · טוב · סביר · לא משהו. Why: every logged day gets a colour, so the calendar never needs a fifth "no rating" look.
5. **When and how long:** a date (default today; quick היום / אתמול / שלשום or any past date) and one-tap length chips. No clock times. Why: fastest to log, and nobody remembers exact times afterwards.
6. **Calendar range:** the last 5 weeks, rolling, Sunday to Saturday, ending with this week; a swipe moves 5 weeks back and forward (never past this week). The stat tiles cover the 5 weeks shown. Why: never opens on a half-empty month.
7. **Several meetups on one day:** the day takes the best rating's colour and dots, with a small count in the corner; tapping lists them all. Why: stays readable at cell size and still shows there was more than one.
8. **Nudge:** the "you haven't seen X in a while" card goes to whoever is most overdue against your usual gap with them: only people with 3+ meetups count, the usual gap is the median gap between their meetup dates, and someone is overdue when days since last meetup exceed it. No one overdue: no card. Why: someone you see yearly doesn't nag you weekly.
9. **Crowding:** Orbit shows up to 15 people (closest first). A person can be hidden from Orbit from their page (their meetups stay); a "כולם" list shows everyone sorted by time since last seen, hidden people included and marked. Why: one-time acquaintances shouldn't stay in Orbit forever.
10. **Optional extras:** each meetup can record what you did (preset tags plus your own, several allowed) and who initiated (אני / הם). Both are optional and never block saving. Why: the user asked for them, kept optional (2026-11-08).
11. **Backup reminder (added 2026-11-08):** as in תפילות, a row on לוח שנה reads "עדיין לא נעשה גיבוי" or "הגיבוי האחרון לפני N ימים" once 7 days have passed since the last backup (or since the first meetup, if there was never one); tapping it exports a backup. The last-backup time is stored under this app's own key (`social-log:last-backup-at`), so a sibling app's backup on the same origin never silences it. Why: the data lives only on the phone, so the backup file is the only other copy.
12. **Bug / idea report (added 2026-11-08):** הגדרות keeps תפילות's "דיווח על באג / הצעה", which opens a GitHub issue on `social-log` with the device and version and no meetup data. Why: same feedback path as the sibling apps.
13. **"How long since" wording (added 2026-11-08, clarifies 8 and 9):** 0 days reads היום; under 14 days "N ימים" (יום, יומיים); under 60 days weeks (שבועיים, "N שבועות"); otherwise months (חודשיים, "N חודשים"), rounded. Used in Orbit labels, the nudge and כולם. Why: dual forms match יומיים and שעתיים.
14. **Calendar details (added 2026-11-08, clarifies 6, 7, 11, assumption 12):** a day's spoken label is "יום חמישי 5.11, מעולה", adding "N מפגשים" only from 2. The count badge shows only from 2. The selected day defaults to today if it has meetups, else the latest day with meetups on the page, else none; its meetups list below the stats, newest first. The backup row sits above the grid and does not move when paging. Before anything is logged the grid, legend and zero stats still show with the hint "עדיין לא נרשמו מפגשים. מפגש חדש נרשם בכפתור +".
15. **Logging details (added 2026-11-08, clarifies 3, 5, 10, assumptions 5, 7, 9, 12):** person chips are ordered by name, and people hidden from Orbit appear only once picked (typing their name picks them). Deselecting a group member keeps the group for wording, which then falls back to names. The extras line under the sentence shows activities and "אני יזמתי" / "הם יזמו"; the note is saved but not shown in the sentence. The date field does not jump to the next slot (iOS fires changes while scrolling); the day chips do. אחר takes 0–23 hours and 0/15/30/45 minutes. Delete asks "למחוק את המפגש?" with "אי אפשר לבטל את המחיקה."
16. **Closing the sentence (added 2026-11-08, clarifies assumption 12):** ✕, שמירה and מחיקה return to the screen the sentence was opened from (the calendar, or a person's page); opened directly, they go to לוח שנה. Why: editing from a person's history shouldn't drop you on another tab.
17. **Rhythm count (added 2026-11-08, clarifies 8):** "3+ meetups" counts meetups, not distinct days; the usual gap needs at least two different days. Why: the code had counted distinct days, which contradicted decision 8.
18. **Renaming friends and editing groups (added 2026-11-08, extends 3 and assumption 9):** a person's page has שינוי שם. הגדרות lists saved groups (קבוצות); each can be renamed or deleted. To change a group's members, delete it and save the right people as a group again from the מי slot. Deleting a group keeps its meetups; their sentence then names the people. Why: a typo in a name or an old group shouldn't be permanent (the user chose rename + delete over full member editing).
19. **Spec-review gaps settled (added 2026-11-08):**
    - People hidden from Orbit never get the nudge; "most overdue" is the largest ratio of days since the last meetup to the usual gap.
    - The person page words the usual gap like decision 13 ("כל 3 שבועות", "כל חודשיים").
    - Tapping a group replaces the people already picked; a group needs at least 2 people.
    - A name added in the מי slot is removed again when you leave the sentence if it ended up in no saved meetup and no group. Why: people couldn't be deleted (until decision 26), so an abandoned log or a typo would stay forever.
    - A person can't be renamed to another person's name ("כבר יש חבר בשם …").
    - Importing a backup counts as a backup made at the file's export time.
    - A backup is refused if a meetup has a future date, an empty place or someone not in the file.
    - Tapping an empty day selects it and says it has no meetups. The hours tile rounds to one decimal.
    - Exactly 7 days ago is still the inner ring (השבוע); exactly 30 days ago is still the middle ring.
    - The place step offers up to 6 past places, most recent first. (Replaced by decision 29.)
20. **A new meetup starts empty (added 2026-11-10, clarifies 2 and 16):** every time + opens the sentence it starts fresh on today (or the tapped day, decision 21) with מי waiting, also after ✕ or after saving another meetup. Why: issue #5; Ionic kept the closed sentence alive, so the next + showed the previous draft.
21. **+ starts on a tapped day (added 2026-11-10, clarifies 14 and assumption 12):** after you tap a day on לוח שנה, + opens the sentence on that day. The day the calendar selects on its own doesn't count, + from חברים or הגדרות always starts on today (the tapped day counts only while the grid is on screen), and tapping a day still only selects it and lists its meetups. The tapped day stays after saving, and is forgotten when the day rolls over at 03:00 or when you page the calendar. Why: issue #6; logging a past day took a trip through the date slot, and an app left open for days shouldn't start a new meetup on an old date.
22. **Hiding suggestions (added 2026-11-10, extends 15 and assumptions 6, 15):** the מי and איפה steps have an עריכה button that puts a ✕ on each suggestion chip. On מי, ✕ hides that person from Orbit (decision 9), which also takes them off the chips; chips already picked and group chips get no ✕, and while עריכה is on, picked chips and group chips can't be tapped until סיום, which stays on screen even when nothing is left to hide (so a double tap or a group tap can't turn a picked chip into a ✕ under your finger). On איפה, ✕ hides the place from מקומות אחרונים, and the next past place moves up; saving a meetup at that place again (a new one, or an edit that moves one there) brings it back. Each ✕ shows a toast with ביטול. Hidden people come back from הגדרות; hidden places have no list. Importing a backup replaces hidden places like everything else, so a file without `hiddenPlaces` leaves none hidden. Why: issue #4; the chips showed everyone and every place, and people couldn't be deleted (assumption 15, until decision 26). (The place parts are replaced by decisions 29 and 30: a place is now removed from the saved list, not hidden, and saving a meetup there doesn't bring it back.)
23. **Period bar and tab pages (added 2026-11-10, clarifies 6):** a tab page ends at the tab bar, so nothing shows around the floating tab bar or the + button. (The ‹ › bar this decision also styled was removed by 27.) Why: the bar looked like a layer over the calendar with the stats showing through around it (#3).
24. **Sheet look (added 2026-11-10, clarifies 12):** the באג / הצעה choice uses the tab bar's pill: a card-coloured track, an ink thumb and a bold label on ink. In dark mode sheets are navy (surface `#1C2238`, cards `#2A3152`, header the sheet's colour). Why: the default iOS thumb had the sheet's own colour and read as a hole, and dark sheets fell back to Ionic's neutral grey (#2).
25. **iOS Safari screenshots (added 2026-11-10, extends assumption 1):** the `ios-screenshot.yml` workflow, copied from תפילות, shows how a branch looks in iOS Safari without the phone. Why: #2 and #3 were found on the phone and could only be checked in Chromium.
    - It runs by hand from the Actions tab on the branch picked under "Use workflow from", and on PRs that edit it.
    - It builds the branch on the `xcode-27` runner and opens `/social-log/` in Safari on an iPhone SE (2nd generation), in Hebrew with the Israel region and on Israel time, with a light and a dark screenshot.
    - Before opening the app, the run marks the branch's version as seen, so the calendar shows and not מה חדש. Only the CI build gets the page that does this.
    - The simulator can only open a page: it can't tap or scroll, so the screenshots show the calendar as it first opens, with no meetups. Sheets and scrolled states are still checked on the phone.
    - The screenshots show a Safari tab, not the Home Screen app.
26. **Managing people in הגדרות (added 2026-11-10, extends 9, 18, 22 and assumptions 15, 16):** הגדרות has a חברים row with the number of people, left out until someone is added. It opens a page that lists everyone by name, with "מוסתר מהמסלול" on hidden people, and replaces the list of hidden people. Tapping a person opens a sheet with their name: הסתרה מהמסלול or הצגה במסלול, and מחיקה only for someone in no meetup and no group. A note under the list says "אפשר למחוק רק מי שלא מופיע באף מפגש או קבוצה." Delete asks "למחוק את {name}?" with "אי אפשר לבטל את המחיקה." Hiding or showing here shows no toast: the row's "מוסתר מהמסלול" changes at once and the same sheet undoes it, unlike the ✕ on a chip (decision 22), where the chip disappears. After the last person is deleted the page stays open with an empty list and its note; back on הגדרות the חברים row is gone. Renaming stays on the person page. Nobody is removed on their own when editing or deleting a meetup or group leaves them in neither. Why: issue #10; a list of only hidden people in הגדרות was confusing, and a typo saved as a second person can't be renamed to a name that's taken, so after the meetup is fixed the leftover person needs a way out.
27. **Paging without a bar (added 2026-11-10, clarifies 6, 23):** nothing sits under the calendar; a swipe pages it. Previous and next 5-week buttons stay for VoiceOver, which keeps one-finger swipes for itself; they aren't drawn, and show only while one has focus (a hardware keyboard, or VoiceOver moving focus), as a surface row with a hairline at the bottom of the page reading "5 השבועות הקודמים" / "5 השבועות הבאים". Next stays disabled on this week. Why: the ‹ › arrows were noise next to the swipe (#9).
28. **Closing the sentence closes the keyboard (added 2026-11-10, clarifies 16):** ✕, שמירה and מחיקה first take focus off any field, so the keyboard is down before the page changes. Once a meetup is saved, שמירה stays disabled until the sentence is gone. Why: issue #12; saving right after typing an activity left a white screen on the iPhone until a touch (Ionic keeps the closed sentence alive, focused field included), and a quick second tap during the closing animation logged the meetup twice.
29. **Saved places and activities (added 2026-11-10, replaces the place parts of 19 and 22, extends assumptions 6 and 8):** the איפה and מה עשינו chips show only places and activities you saved.
    - Places: every saved place, the most recently used first; ones never used follow, newest saved first. Activities: in the order saved, then this meetup's unsaved ones.
    - Logging a meetup saves nothing by itself. While the typed place, or an activity in the meetup, isn't saved, a quiet "שמירת „X” לפעם הבאה" button under it saves it at once; it stays saved even if the sentence is then closed.
    - On update the lists start as the chips shown before: the 6 recent places that weren't hidden, the 6 presets, then your own activities newest first. A new phone starts with the 6 presets and no places.
    - Why: issue #13; not every place or activity is worth keeping (the user chose to start from the chips they had, and a button over a popup so logging isn't interrupted).
30. **Editing saved places and activities (added 2026-11-10, extends 18 and 22):**
    - עריכה on איפה and on מה עשינו puts a ✕ on saved chips; on מה עשינו, as on מי, picked chips get no ✕ and can't be tapped until סיום. On both steps סיום stays on screen even when nothing is left to remove. ✕ removes the item from the list, with a toast and ביטול.
    - הגדרות lists מקומות שמורים and פעילויות שמורות, each hidden when empty. A row offers שינוי שם and מחיקה; מחיקה has ביטול in a toast and no confirm.
    - Renaming changes every past meetup with exactly that text, and an activity a meetup would then list twice is listed once. A name that's already saved is refused ("כבר יש מקום בשם „X”"). Deleting leaves past meetups as they are. The presets are ordinary saved activities.
    - Why: issue #13; quick removal where the chip is, renaming where there's room, and renaming works like friends (decision 18) so a typo fix also fixes history.
31. **Splitting what was typed together (added 2026-11-10):** when the text has a comma, or a later word that starts with ו ("דני, רוני ומיכל"), הוספה (or the keyboard's done) on מי and on מה עשינו asks "להוסיף בנפרד?" with the parts ("דני · רוני · מיכל") and פיצול ל־N / להשאיר כמו שכתוב. Split names each go through the usual new-name path, which reuses an existing exact name. A meetup keeps one place, so for places only the save button offers the split ("לשמור בנפרד?"), and the meetup keeps the text as typed. The save button goes away once the typed place, or every one of its parts, is saved. Text with a single part is added directly as that part, so "דני," adds דני. Dismissing the question adds nothing and keeps the text. Why: issue #14; it's an offer and never automatic, because names like ורד start with ו.
32. **Activity text that wasn't added (added 2026-11-10, clarifies 10):** text left in פעילות אחרת when שמירה is tapped is added to the meetup as typed, with no split offer, and isn't saved to the list. Why: found while mapping #12; it was silently dropped.

## Assumptions (accepted by the user)

1. **Stack:** same as תפילות — React 19 + TypeScript + Vite, Ionic React in iOS mode, hash router, Dexie with persistent storage, `vite-plugin-pwa` (`registerType: 'prompt'`), valibot for the backup file, Vitest + Testing Library + fake-indexeddb, oxlint. Heebo self-hosted through `@fontsource/heebo`. Public GitHub repo on the personal account, GitHub Pages at `/social-log/`; repo creation and pushes only when the user asks.
2. **Dark mode** follows the phone. Dark colours are derived from the light ones and contrast-checked (see Colours).
3. **Orbit rings:** inner = met within the last 7 days, middle = within 30 days, outer = longer. All circles are the same size. People never met are not shown.
4. **Nudge** stays hidden until someone qualifies (decision 8).
5. **Length chips:** חצי שעה, שעה, שעה וחצי, שעתיים, 3 שעות, 4 שעות, plus אחר (hours and minutes). Stored as minutes.
6. **Place:** free text, with saved places offered (decision 29); the user types the preposition ("בטיילת", "אצל נועם"). Required, like the other sentence slots.
7. **Extras placement:** "what we did", "who initiated" and a note sit under the rating on the last step; when filled they extend the sentence.
8. **Activity presets:** אוכל, קפה, הליכה, בבית, ספורט, הופעה/סרט, plus your own; several per meetup. The presets are the first saved activities on a new phone (decision 29).
9. **People:** typing a new name in the מי slot adds a person; picking people and tapping "שמירה כקבוצה" saves a group with a name.
10. **Sentence wording for people:** the group name when exactly its members came (an extra person means names, per decision 3); otherwise up to three names in full ("תמר, מאיה ונועם"), and from four on two names and "ועוד N" ("תמר, מאיה ועוד 2"). Older dates read "ביום חמישי 5.11".
11. **Person page:** from Orbit or כולם: number of meetups, last meetup, usual gap, who usually initiates, history, and hide/show in Orbit.
12. **Editing:** tapping a day lists its meetups; tapping one reopens the sentence filled in, to edit or delete (with confirmation).
13. **Stats tiles:** meetups, how many were מעולה, and hours, over the 5 weeks shown.
14. **Dates:** Gregorian only; no future dates; no reminders or notifications. A day rolls over at 03:00 like תפילות, so a meetup logged at 01:00 defaults to the previous evening's date.
15. **Data:** `Person { id, name, hidden, createdAt }`, `Group { id, name, memberIds }`, `Meetup { id, date, personIds, groupId?, place, minutes, rating 1–4, activities?, initiator?, note?, createdAt }`, `SavedChoice { name, savedAt }` in `savedPlaces` and `savedActivities` (decision 29). Both are optional in the backup file; a file without them gets the chips its meetups showed, reading an older file's `hiddenPlaces` for that. `hiddenPlaces` is no longer exported. A backup is also refused if a saved place or activity has an empty name. People are never deleted, only hidden, except someone in no meetup and no group (decisions 19 and 26). A meetup lasts a whole number of minutes from 1 to 1440; a backup with anything else is refused. The backup file is `version: 1`; new fields must be optional so old backups still import. No account, no server.
16. **Settings:** a gear on the calendar opens הגדרות: backup export/import, saved groups, saved places and activities (decision 30), חברים (hide, show and delete people, decision 26), and the version line with מה חדש.

## Colours

Light (validated 2026-11-07 with the dataviz palette validator; contrast vs a white empty day):

| Token | Hex | Use | Contrast |
|---|---|---|---|
| ground | `#EEF2F9` | page background | |
| surface | `#FFFFFF` | cards, empty days | |
| ink | `#141A33` | text, actions, selected tab, + button | |
| muted | `#4A5270` | secondary text | 7.7:1 on white |
| great | `#2B34C9` | מעולה, white text, 4 dots | 8.6:1 |
| good | `#6E7BEA` | טוב, ink text, 3 dots | 3.7:1 (text 4.6:1) |
| okay | `#6B7084` | סביר, white text, 2 dots | 4.9:1 |
| meh | `#B3590B` | לא משהו, white text, 1 dot | 4.8:1 |

Rules: indigo means only מעולה; actions use ink. A rating is never shown by colour alone (dots on days and buttons, text labels in lists).

Dark (validated 2026-11-08 against surface `#1C2238`; colour-blind and normal-vision separation pass):

| Token | Hex | Contrast |
|---|---|---|
| ground / surface / ink / muted | `#0F1324` / `#1C2238` / `#EEF1FA` / `#A9B0C8` | ink 13.9:1, muted 7.3:1 on surface |
| sheet / sheet card | `#1C2238` / `#2A3152` | ink 11.2:1, muted 5.9:1 on sheet card (added 2026-11-10, decision 24) |
| great | `#8C95FF`, dark text | 5.9:1 vs surface, text 6.9:1 |
| good | `#5562DA`, white text | 3.1:1 vs surface, text 5.3:1 |
| okay | `#7C8197`, dark text | 4.1:1 vs surface, text 4.8:1 |
| meh | `#E08A3C`, dark text | 5.9:1 vs surface, text 6.9:1 |

In dark mode מעולה is the brightest rating rather than the darkest, so it still stands out most.
