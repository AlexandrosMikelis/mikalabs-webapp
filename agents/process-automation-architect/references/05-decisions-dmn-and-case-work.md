# Step 4: deciding with DMN, and handling expert-driven work with CMMN

Use in `assess` to spot rules worth extracting and in `design` to write them. Normative sources: OMG DMN 1.5 (check which revision and which FEEL features your engine implements; support varies), and OMG CMMN 1.1 (stable since 2016; execution support is thin, so verify before relying on it). Worked examples and the extraction test are MIKA's.

## When should a rule leave the flow and become a decision?
Rules change faster than flows and are owned by different people (pricing, clinical governance, compliance). Inside gateways or code they are invisible and every change needs a release. A Business Rule Task calls a decision that lives in its own versioned artefact, is tested on its own and can be reused by several processes or services.

MIKA's **extraction test**: extract a decision when two or more of these hold.
1. Three or more gateways in a row test amounts, categories, regions, ages or dates.
2. Someone says "the policy says…" or "it depends on the tariff/segment/species".
3. A business team keeps the rules in a spreadsheet.
4. The same rule exists in two systems with small differences.
5. An auditor or regulator may ask why a specific case got a specific result.

## How is a decision table written?
One row per rule; inputs on the left, outputs on the right; `-` means "any value".

Example: surplus payout for a community energy co-op (invented figures).

| # (hit policy U) | Member type | Export this quarter (kWh) | Arrears? | → Payout route | → Rate (€/kWh) |
|---|---|---|---|---|---|
| 1 | household, business | < 50 | - | roll_over | 0 |
| 2 | household | [50..2000] | false | bank_transfer | 0.08 |
| 3 | household | > 2000 | false | bank_transfer | 0.07 |
| 4 | business | ≥ 50 | false | invoice_credit | 0.065 |
| 5 | household, business | ≥ 50 | true | offset_against_arrears | 0.08 |
| 6 | community_facility | - | - | board_review | - |

Check row 5 against rows 2–4: with UNIQUE, a household with arrears and 500 kWh matches only row 5 because rows 2–4 require `false`. That kind of manual overlap check is exactly what engines and DMN linters automate.

### Which hit policy fits?
DMN 1.5 defines single-hit and multiple-hit policies.

| Policy | Code | Behaviour | Ergane's guidance |
|---|---|---|---|
| Unique | U | At most one row may match; overlap is an error | Default choice; forces a complete, clean rule set |
| Any | A | Several may match if outputs are equal | Rules written by several people that must agree |
| Priority | P | Highest-priority output among matches | Outputs with a natural rank (strictest approval wins) |
| First | F | First matching row in order | Use sparingly; precedence by position hides logic |
| Collect | C (+ sum, min, max, count) | All matches, optionally aggregated | Score sheets, lists of required documents |
| Rule order | R | All matches in row order | Ordered action lists |
| Output order | O | All matches sorted by output priority | Ranked suggestions |

Completeness: with U, every input combination should hit one row. Add an explicit catch-all row with a safe output (route to a person) instead of leaving gaps.

### FEEL in practice
DMN expressions are written in FEEL: comparisons (`> 2000`), ranges (`[50..2000]`, `(0..50)`), lists (`"household","business"`), negation (`not("community_facility")`), temporal values (`date("2026-12-31")`, `duration("P90D")`) and boxed expressions for calculations. Keep table cells simple; move calculations into their own decisions.

## How are larger decisions structured?
A **decision requirements graph** (drawn as a DRD) breaks a decision into parts:
- **Decision** nodes, each with a table or expression;
- **Input data** (species, age, weight, export kWh);
- **Business knowledge models**, reusable functions such as a dosage scorecard;
- **Knowledge sources**, the policy or regulation behind a rule.

Example (veterinary clinic network): "Referral urgency" depends on "Clinical severity" (from presenting signs and vital signs) and "Patient risk" (from species, age band, comorbidities). Each sub-decision is tested alone. Knowledge sources link each rule to the clinical guideline that justifies it, which is what an audit asks for.

## How does a decision plug into a flow?
- Map inputs explicitly; write outputs to named variables; branch on them immediately after.
- Return a reason or matched-rule identifier with every result, for audit and for explaining the outcome to staff and customers.
- Version decisions independently of flows and record the decision version used per case.
- Decide whether a long case uses the decision version current at call time (usual) or at case start (for consistency over months).
- High-volume, low-latency uses (fare calculation at checkout) can call the decision service directly without any flow.

## How are decisions tested and governed?
- A test table per decision: inputs → expected outputs, including boundaries (exactly 50 kWh, exactly 2,000 kWh, the day a tariff changes).
- Run tests in CI; owners review rule changes as row diffs in pull requests.
- Split rights: rule owners edit rows within agreed bounds; new inputs or outputs go through development.
- Watch for drift: two tables that should agree but are maintained apart; a collect table growing with nobody checking totals.

## How do decisions and AI work together?
- A model produces a score or class; a table owned by the business turns it into an action with explicit thresholds.
- An LLM extracts structured inputs from a document; the table decides with them, so the decision stays deterministic and explainable.
- An LLM never silently replaces a regulated table. When an AI recommendation feeds a decision, record both the recommendation and the rule that acted on it (see `09`). GDPR Article 22 limits decisions based solely on automated processing with legal or similarly significant effects; confirm the position with legal counsel.

## What if experts decide the order of work?
Some work has no predictable sequence: a complex animal-welfare investigation, a contested grid-connection dispute, a ferry incident inquiry. Experts choose the next step; tasks become available when conditions hold.

CMMN 1.1 concepts: **case file** (the data), **stages**, **tasks** (human, process, decision, case), **discretionary items** (optional work an expert may plan in), **sentries** (entry and exit criteria based on events or data), **milestones**.

| Situation | Ergane's choice |
|---|---|
| Order mostly known, variants enumerable | BPMN flow with DMN decisions |
| Experts choose the order, engine supports CMMN well | CMMN case model |
| Experts choose the order, engine is BPMN-only | Ad-hoc sub-process, event sub-processes for anytime events, a case-level task list driven by conditions |
| Mixed (most common) | BPMN frames intake, deadlines and closure; a case-like stage in the middle for expert work; BPMN sub-processes for structured parts such as payment and letters |

Flowable is one engine that executes BPMN, CMMN and DMN together; check current support in any engine you consider.

## Decision smells
- A gateway staircase where a table belongs.
- A FIRST table where rows silently shadow each other.
- No catch-all row, so unforeseen inputs fail at run time.
- No reason returned, so staff cannot explain an outcome.
- Decision version not recorded per case.
