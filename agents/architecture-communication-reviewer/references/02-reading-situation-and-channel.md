# Step R2 — Where, when and how will the reader meet it?

A view that works on a 27-inch monitor can fail on a wall display at the back of a room, on a phone on a ferry deck, or in a call recording watched by a colleague eight hours away. Settle the reading situation before checking visual detail; it sets the limits for size, density and how self-contained the artefact must be.

Grounding: the resize and reflow success criteria covered in `07`, the GitLab public handbook pages on asynchronous communication and handbook-first documentation, GOV.UK guidance on writing for the web, and MIKA's medium limits and stand-alone readiness check below.

## Classify the situation
Record two things in the intake card (`01`): the **medium** and the **mode of attention**.

| Medium | Constraint that matters most |
|---|---|
| Printed page | Upright page; no zoom; colour may be lost on a mono printer |
| Laptop or monitor | Readers can zoom and scroll; good for dense reference views |
| Phone or tablet | Narrow width; wide diagrams become pinch-and-pan puzzles; tables must reflow |
| Wall display or beamer | Far viewing distance; low contrast in lit rooms; landscape only |
| Shared screen on a video call | Compressed video blurs thin lines and small text; viewers cannot zoom; the presenter controls the pace |
| Wiki page, pull request, search result | Read out of order, often arrived at from a link; must stand alone |

| Mode of attention | What it demands |
|---|---|
| **Live, presented** | The speaker carries context; the artefact can be sparser but must work at speaking pace |
| **Live, discussed** | Shared editing or whiteboard; drafts welcome; record the outcome afterwards |
| **Asynchronous** | No author in the room. The artefact must carry its own context, decision, ask and date |
| **Archival** | Read months or years later by someone who was not involved; status, date and rationale matter most |

Most architecture artefacts start live and end archival. Review for the harder of the two.

## MIKA medium limits
Rules of thumb, not standards. Breaching one is a finding only if the primary reader is affected.

| Medium | Max elements in one view | Smallest text | Lines | Other |
|---|---|---|---|---|
| Wall display / beamer | about 12 | 24 px equivalent at 1080p | 2 px or heavier | Landscape; keep the key on the same slide |
| Shared screen on a call | about 15 | 20 px equivalent | 2 px | Avoid pale tints that compress to grey; zoom into parts rather than panning |
| Laptop reference page | about 25 | 12 px | 1 px fine | Allow zoom; supply SVG, not a flat image |
| Phone | about 8 per screen | 14 px | 2 px | Provide a text outline of the view that reflows on narrow screens |
| Print | about 30 on A3, 20 on A4 | 9 pt | 0.5 pt | Encode with shape and line style, not colour alone |

When an artefact must serve several media, split it: a sparse slide version and a dense reference version generated from the same source (`10`).

## Will it work without the author?
Distributed teams, rotating reviewers and future maintainers all read without the author present. A public reference for working this way is GitLab's handbook, which treats written, linkable, single-source pages as the default and meetings as the exception. MIKA turns that into a check.

### MIKA stand-alone readiness check (AR1–AR6)
Score each item met / partly / not met.

| # | Check | Met when |
|---|---|---|
| AR1 | **Self-contained context** | A reader arriving from a link learns what system, what scope and why this exists in the first screen |
| AR2 | **Explicit ask** | The response wanted, who should give it and the date are written down, not implied |
| AR3 | **Stable link** | It lives in one durable place (repo, wiki, decision log) rather than an attachment or chat message |
| AR4 | **Status and date** | Draft / proposed / accepted / replaced, plus last-updated date and owner |
| AR5 | **Decision record** | Outcomes of any meeting about it are written back with decisions, owners and dates within one working day |
| AR6 | **Fair participation** | Comment windows span at least one full working day in every participating location; no decision is final in a meeting some reviewers could not attend |

Two or more "not met" on an artefact that must work asynchronously → a High finding (lens: Reading situation). One → Medium.

## Are deadlines and meetings fair to every location?
- State deadlines with a UTC offset or zone name, or as an end of day in a named city, and prefer dates over weekdays ("by 12 March, 17:00 Europe/Athens", not "by end of week").
- Rotate any recurring live review slot so the same people do not always join at night.
- Give a comment window of at least 24 hours, and longer across more than eight hours of spread.
- Treat no reply as "not yet read", not as consent.
- Record decisions where everyone can find them; a recording of a call is not a decision record (it is hard to search and expensive to replay).

## Live review on a video call
When the artefact will be shown on a shared screen:
- Send it beforehand with the ask, so reviewers arrive having read it. Use the meeting for disagreement, not for first reading.
- Present one view at a time; zoom into a region rather than showing the whole landscape at thumbnail size.
- Put a visible view title and the key on every shared slide; latecomers and people on small screens will rely on it.
- Name what you are pointing at in words ("the lab results gateway, top right"); a mouse pointer is invisible to anyone on a phone or a recording.
- Check thin lines, pale fills and small type against the compressed video; when in doubt, thicken and enlarge.
- Close by stating the decisions and actions, then write them to the decision log (AR5).

## Messages, chat and email
Short channels carry architecture news more often than documents do.
- Put the point and the ask in the first line or subject: "Decision needed by 12 March: keep the HarbourLine ticket archive on-premises?"
- Link to the single source; do not paste a copy of the diagram that will drift (`10`).
- One topic per thread; summarise long threads into the decision log and link back.
- Flag something as urgent only when it is. Overused, the flag stops working.

## Tools and spaces
Tool sprawl splits knowledge. When reviewing a documentation set or a team process, check:
- Is there one agreed home for each kind of artefact (decisions, diagrams, runbooks, discussion)?
- Can every participant, including partners and contractors, open the format without a paid licence?
- Do diagrams stay editable (source kept) rather than exported once as images?
- Are retention and access rules clear for confidential material?

## House examples
- *GridShare* volunteers work evenings in three countries. Their architecture proposals pass AR1–AR4 but decisions are taken in a monthly call and never written back (AR5 not met) and the call always falls at 23:00 for one group (AR6 not met). Finding: High, Reading situation. Fix: decision log entry within a day; rotate the slot; 72-hour comment window.
- *HarbourLine* shows its deployment view on the bridge-crew briefing screen. 34 elements with 10 px labels: breaches the wall-display limit. Fix: split into a "ship systems" and a "shore systems" view, 24 px labels, key repeated on both.

## Review checks for this step
- Is the medium known or assumed? Does the artefact fit its limits?
- Does it need to work asynchronously? Run AR1–AR6.
- For live use: is there a pre-read, a visible title and key per slide, and a written outcome?
- For multiple media: is there one source with media-specific renderings?
