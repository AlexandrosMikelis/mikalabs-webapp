# Step 1 — Intake: who is the customer, and is this really one service?

Hestia's first step on every request. It fixes the facts every later step depends on. For `review`, record the answers as ASSUMPTIONS where the caller did not give them; for `design`, they fill the PRODUCT line.

Grounding: AWS Well-Architected SaaS Lens (general design principles), Azure Architecture Center "Architect multitenant solutions" (the questions to ask before choosing a model), Google Cloud guidance on SaaS and GKE cluster multitenancy, and MIKA's own intake card below.

## What counts as a tenant here?
A tenant is the unit you sell to, bill, and keep apart from every other unit. Decide it before anything else, because the choice fixes identity, data keys, quotas, cost allocation and erasure scope.
- Most B2B products: an organisation (a clinic group, a ferry company, an energy co-op).
- Some products: a workspace or project inside an organisation, with the organisation as the billing parent.
- Consumer products: often the individual, with households or families as an optional grouping.

Azure's guidance separates the *logical* tenant (the customer as a business entity) from the *physical* placement (the stamp or database that serves it). Keep that split: a logical tenant keeps one opaque identifier for life, while its physical placement may move many times.

Two edge cases to settle up front:
- **Parent and child customers.** A national clinic group with 40 practices: is the group the tenant, with practices as sub-units, or is each practice a tenant linked to a parent? Pick one; record it in the catalog (see `03`).
- **People in several customers.** Locum vets, freelance dispatchers, auditors. Plan for one identity with several memberships from day one (see `05`).

## The intake card
Collect or assume these. Each one moves a later decision; the right-hand column says which.

| Fact | Example value | Drives |
|---|---|---|
| What a tenant is | clinic group | identifiers, erasure scope, billing parent |
| Tenant count now and in 3 years | 600 → 4,000 | shared vs dedicated, stamp size |
| Size spread | 90% under 20 users; 12 groups over 1,000 | where dedicated capacity pays |
| Load shape | weekday mornings, monthly vaccination reminders | fairness controls, scaling |
| Plans sold | Starter, Practice, Group Enterprise | quotas, entitlements, placement |
| Buying motion | self-service sign-up vs sales contract | provisioning paths |
| Data sensitivity | owner personal data, payment data, controlled-drug logs | required isolation rung (`06`) |
| Jurisdictions | EU and UK; one Swiss customer | residency, stamps per region |
| Contract promises | dedicated database, customer-managed keys, 99.95% | which plans need dedicated parts |
| Team size and skills | 6 platform engineers, strong on Kubernetes | operational burden ceiling |
| Current state | greenfield, or N hosted copies on M versions | convergence path (`10`) |

If a fact is missing and would change a severity or a placement, write it as an assumption, carry on, and list the question under OPEN QUESTIONS with the decision it would move.

## Is this one operated service, or many hosted copies?
Run this test before any technical lens. A product can share every server and still fail it, or give each customer its own stack and still pass it.

**MIKA single-service test** — score 1 point for each "yes":
1. All customers run the same release (feature flags allowed, forks not).
2. A new customer of any plan is created by the same automated workflow.
3. One release pipeline reaches every customer environment.
4. One place shows health, usage and cost for every customer.
5. Customer differences live in configuration and entitlements, not in code branches.
6. Adding the 500th customer costs roughly the same effort as adding the 5th.

| Score | Reading | Typical finding |
|---|---|---|
| 6 | One service | none |
| 4–5 | One service with leaks | Medium per failing item |
| 2–3 | Hosting with a shared brand | High: margins and change speed will not scale |
| 0–1 | Managed hosting | High; Redesign verdict if the plan is to grow on this model |

Symptoms of the hosting trap: customers pinned to old versions by contract, "special" builds for big accounts, onboarding run as a project with tickets, a monitoring setup per customer, and nobody able to say what a customer costs to serve.

## What the business needs from the architecture
Ask what the product is trying to win, because the architecture is judged against it.
- **Margin**: cost to serve must grow slower than revenue. Needs cost visibility per customer and per plan (`09`).
- **Speed of change**: one codebase, one pipeline, progressive exposure (`10`).
- **Time to value**: minutes from sign-up to first useful screen for self-service plans (`04`).
- **Trust**: no customer can reach another's data, whatever is shared (`06`).
- **Resilience**: a fault reaches a bounded slice of customers, not all of them (`02`, `08`).
- **Learning**: usage signals per customer feed product decisions.

Do not let technology lead. Teams that start with "we're on Kubernetes, how do we add tenancy?" tend to forget provisioning, metering and the operations view until late.

## House examples used across Hestia's references
Three fictional MIKA products recur in examples. They are illustrations, not real systems.
- **VetFlow** — practice-management SaaS for veterinary clinic networks. Tenant = clinic group. Data includes pet-owner personal data, prescriptions and controlled-drug registers. Plans: Starter (single practice), Practice, Group Enterprise.
- **HarbourLine** — booking, manifest and crew-rostering SaaS for regional ferry operators. Tenant = ferry operator. Heavy seasonal peaks; safety-of-life manifests that must stay available offline at the quay.
- **GridShare** — member, metering and settlement SaaS for community energy co-ops. Tenant = co-op. Half-hourly meter readings at volume; settlement runs each month; members' bank details.

## Output of this step
```
PRODUCT: <what, for whom, what a tenant is, count now/3y, spread, plans>
ASSUMPTIONS: <one line each>
SINGLE-SERVICE SCORE: <0–6, failing items>
SENSITIVITY: <highest data class → required isolation rung, see 06>
JURISDICTIONS: <regions; residency flags for compliance>
```

## Worked mini-example
HarbourLine today: 35 ferry operators, each on its own VM set, three versions in production, onboarding takes three weeks. Single-service score: 1 (only item 5 partly). Reading: managed hosting. Intake conclusions: tenant = operator; 35 → 120 in three years; strong summer peaks; EU and Norway; manifests are safety-critical. Next steps: tenancy fit (`02`), then the convergence path (`10`) because the current state is many hosted copies.
