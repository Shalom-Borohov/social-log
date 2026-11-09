# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Users

One person, the owner: an Israeli Hebrew speaker who wants an honest record of time spent with friends. They log a meetup right after it ends, usually on the way home: one-handed, walking or as a passenger, in about half a minute.

## Product Purpose

נפגשנו records each meetup with friends (who, when, where, how long and how it went) and turns the record into two answers: what the last weeks of social life looked like (the calendar), and who you are drifting away from (the friends orbit). Success is that logging takes seconds, and that the app quietly shows a friend you are overdue to see.

## Positioning

A private log that measures closeness by your own rhythm with each person: the nudge fires when a friend is overdue against your usual gap with them, not on a fixed schedule. Logging is one fill-in sentence ("אתמול ראיתי את תמר ומאיה בטיילת במשך שעה וחצי והיה מעולה") instead of a form.

## Operating Context

- Logging: right after the meetup, on the go, one hand; defaults (today, recent places, chips) carry most of the input.
- Reviewing: opening the calendar or the friends tab now and then to see the pattern and who is overdue.
- Data lives only on the phone; a JSON backup file is the only other copy, so the app reminds about backups weekly.

## Capabilities and Constraints

- Installed as a Home Screen web app (PWA) on iPhone; Hebrew, RTL; offline.
- React + Ionic in iOS mode, Dexie (IndexedDB), no server and no account.
- Decisions and assumptions live in `docs/specs/2026-11-08-social-log-design.md`; that spec is the source of truth for behaviour.
- No notifications or reminders other than the in-app backup row; no sharing.

## Brand Commitments

- Name: נפגשנו (chosen by the owner). Repo and folder: `social-log`.
- Voice: quiet and factual, like the sibling app תפילות. Numbers and plain labels, no praise and no guilt; "לא ראית את תמר 4 חודשים" is stated, never scolded.
- The chosen screens are on the design canvas https://claude.ai/artifact/Rj6WfdddijRwGoLbbhtWsh (page "Your combination", row "New colours", logging look A).

## Evidence on Hand

No real data yet; all names on the canvas are samples. No testimonials or metrics exist, and none should be invented.

## Product Principles

1. **Seconds to log.** The sentence is filled mostly by taps and defaults; only a new place or person needs typing.
2. **Pattern at a glance.** The calendar and orbit answer their question without a tap; details are one tap away.
3. **Never colour alone.** Every rating also shows as dots or words, so it reads in sunlight and for colour-blind eyes.
4. **Private by default.** Only the owner ever sees the data, so ratings can be honest.
5. **Native, not novel.** iOS conventions for navigation, sheets and controls; the sentence is the one signature interaction.

## Accessibility & Inclusion

44pt touch targets; light and dark follow the phone; text contrast at least 4.5:1 and rating colours at least 3:1 against an empty day; VoiceOver labels name the date and rating of each calendar day.
