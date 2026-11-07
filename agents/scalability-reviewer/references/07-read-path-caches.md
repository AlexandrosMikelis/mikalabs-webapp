# Step 7 — Check the read path and its caches

A cache is often the cheapest capacity multiplier for read-heavy systems. It also adds staleness, a new failure mode and another thing to run. Atlas checks caches after the store layer because a cache's job is to protect that tier, and its failure modes are judged by what the store layer can survive.

## Why does a cache pay off?
Reads are skewed: a small set of keys takes most of the traffic (today's open appointment times, this week's sailings, the tariff table). Holding that hot set close to the caller removes repeated queries, remote calls and rendering.

### The numbers that matter
- Origin load = reads × (1 − hit ratio). From 90% to 99% hits cuts origin load **tenfold**. Small changes at the top end matter a great deal.
- Effective latency ≈ hit ratio × cache latency + (1 − hit ratio) × (cache latency + origin latency).
- Size for the **working set** (keys read within one TTL), not the whole dataset.

House example — the vet network's booking site reads appointment availability 15,000 times a second during the 08:00 rush. At 95% hits the clinic database sees 750 reads/s. If the cache restarts and hits fall to 60%, the database suddenly sees 6,000/s, eight times more. Atlas asks whether the database survives that, and if not, which protection (below) is in place. **Design the origin for a cold or degraded cache**, or guard it.

## Where can a copy live?
| Layer | Examples | Notes |
|---|---|---|
| Client | Browser HTTP cache, app storage | Free capacity, steered by response headers |
| Edge / CDN | Static assets, public schedules, slow-changing API responses | Absorbs global spikes; purging is slower |
| Reverse proxy | Caching proxy in front of a service | Shared by all instances; good for public GETs |
| In-process | Local memory map | Fastest; one copy per instance, so instances disagree; lost on restart |
| Shared in-memory store | Open-source in-memory stores and their managed equivalents | One copy per key; one network hop; must itself scale and stay up |
| Inside the database | Buffer pool, materialised views | Tune before adding an external cache |

## Who fills the cache and when?
| Pattern | Read behaviour | Write behaviour | Main risk |
|---|---|---|---|
| Lazy fill | App checks cache, falls back to store, then fills | App writes store, then deletes key | Stale data if delete is missed; miss bursts on cold start |
| Read-through | Cache layer loads from store on a miss | As lazy fill | Same, logic moved into the cache layer |
| Write-through | Always fresh | Write goes to cache and store synchronously | Slower writes; cache fills with unread data |
| Write-behind | Fresh in cache | Cache flushes to store later | Confirmed writes lost if the cache dies |
| Refresh-ahead | Popular keys refreshed before expiry | — | Wasted refreshes for keys that cooled |

Write-behind is acceptable only where losing confirmed writes is tolerable, or the cache itself is durable and replicated. For anything with a zero staleness budget (`02`), the cache must never be the authority.

## How stale may each cached item be?
Tie every TTL to the staleness budget in `02`.
- **TTL** per data type: seat counts seconds, clinic opening hours hours, country lists days. Add random **jitter** so keys written together do not expire together.
- **Delete on change** rather than overwrite, so a slow writer cannot put an older value back. Change-data-capture or domain events can trigger deletes across services.
- **Versioned keys** (`tariffs:v42`): a change creates a new key; old ones age out.
- **Negative caching**: remember "not found" briefly, so absent keys cannot be used to hammer the store.
- **State the user-visible promise**: "Other receptionists may see the old phone number for up to 60 seconds; you see yours at once" (read-your-writes for the editor by reading through, or by updating the editor's own entry on write).

## What can HTTP-level caching do for free?
Defined in RFC 9111 (caching) and RFC 9110 (semantics, conditional requests):
- `Cache-Control` sets who may store (`public`, `private`), for how long (`max-age`, `s-maxage` for shared caches), and whether to revalidate first (`no-cache`) or never store (`no-store`).
- **Validators**: an `ETag` with `If-None-Match` lets a client revalidate cheaply; the server answers `304` with no body when nothing changed.
- `stale-while-revalidate` and `stale-if-error` (RFC 5861) let caches serve a slightly old copy while refreshing or during an origin outage — a cheap resilience win.
- `Vary` names the request headers that change the response. Too many and hit ratios collapse; too few and users get the wrong variant (the wrong language, or worse, someone else's data).
- Personalised pages: cache the shared shell publicly, fetch personal parts separately with `private`.

## How does the cache tier itself scale?
- **Full copy on every node**: reads scale with nodes, memory does not. Fits small, very hot data such as tariff tables.
- **Keys spread across nodes by hashing**: memory and throughput grow with nodes. Use consistent hashing so adding a node remaps only a fraction of keys (`04`). A client library or a local proxy (`10`) can hide the topology.
- **Spread and replicated**: each slice of keys has copies, so losing one node does not send its whole slice to the origin at once.
- **Get the key right.** It must contain exactly the inputs that change the result. Extra inputs (timestamps, client IPs that do not affect output) make every request miss; missing inputs (language, clinic, customer) serve the wrong result, which can be a data-protection incident.
- **Hot keys** (the opening-day sailing list read by everyone) can saturate one node. Options: a small in-process layer for those keys; several copies under suffixed keys read at random; request coalescing.

## How do caches fail?
- **Stampede**: a popular key expires and hundreds of requests miss together and hit the origin. Defences: single-flight refill (one caller fetches, the others wait), a short lock or lease on refill, early probabilistic refresh, TTL jitter.
- **Cold start**: after a deploy or restart the hit ratio is zero. Warm before taking traffic (readiness gate, `08`), restart cache nodes one at a time, and capacity-plan the origin for a degraded ratio.
- **Hidden criticality**: if the system cannot work without the cache, the cache is on the critical path and needs database-grade availability. Decide explicitly: "cache down = slower" or "cache down = outage".
- **Race between update and delete** can leave an outdated value cached. Delete on write, keep a TTL as safety net, use compare-and-set or versioned values where it matters.
- **Memory pressure**: pick a removal policy for a full cache (LRU or LFU are common) and watch how often entries are pushed out; a high rate means the working set does not fit.
- **Very large values** hurt latency and network; split or compress.

## MIKA cache verdict rule
| Condition | Rating if missing |
|---|---|
| Origin survives the hit ratio halving, or is protected against stampedes | High (Critical if origin is a single primary at flash peak) |
| Every TTL traces to a staleness budget | Medium |
| Cache key complete (includes customer/clinic/language where relevant) | High — correctness and privacy |
| "Cache down" behaviour decided and tested | Medium |
| Hot keys identified and handled | Medium, High at flash peaks |

## Questions Atlas asks at this step
- What is the hit ratio, and what does the origin see if it halves?
- Does each TTL match a stated staleness budget?
- Is the key complete and minimal?
- Are stampedes and hot keys handled?
- Is the cache optional or critical, and is that deliberate?
