# Collections, pagination and queries

## Return collections in an envelope
- A list endpoint that returns a bare JSON array cannot later gain pagination links, counts or metadata without changing the top-level type, which breaks every consumer. Return an **object** that contains the array from day one, e.g. `{"value": [...], "nextLink": "..."}` (Microsoft style) or `{"items": [...], "nextPageToken": "..."}` (Google AIP-158 style).
- Choose one envelope shape for the whole API.
- Severity in review: a bare top-level array on a collection that can grow is at least **Medium** for a new API (cheap to fix now, breaking later), **High** if external consumers are about to integrate.

## Pagination
- Any collection that can grow without bound must be paginated, with a **server-enforced maximum page size** and a documented default.
- **Cursor / token pagination** (opaque `nextLink` or `pageToken`): stable under inserts and deletes, scales to large sets, hides implementation. Preferred default. Tokens are opaque: consumers must not parse or construct them.
- **Offset/limit**: simple and allows jumping to page N, but slow on large offsets and skips or duplicates items when data changes between requests. Acceptable for small, stable sets or admin UIs.
- Keyset pagination (by a sorted unique key) is the usual implementation behind cursors.
- Total counts are expensive on large sets; make them optional (`$count=true` / `includeTotal`) rather than always computed.
- Signal the end clearly: absence of the next link/token.
- Design in line with the chosen standard even if only the first page is implemented at launch; adding fields later is compatible, changing the shape is not.

## Filtering, sorting, field selection
- Pick **one** query convention and use it everywhere:
  - OData-style (Microsoft guidelines): `$filter=displayName eq 'Jim'`, `$orderby`, `$top`, `$skip`, `$select`.
  - Simple parameters: `?status=active&createdAfter=2026-01-01&sort=-createdAt`.
  - Google AIP-160 filter expressions.
- Document which fields are filterable and sortable; unbounded arbitrary filtering on unindexed fields is a performance and denial-of-service risk.
- Sort order must be deterministic (add a unique tiebreaker) or pagination will be inconsistent.
- Sparse fieldsets (`$select`, `fields=`) reduce payloads for constrained clients. If consumers need heavy cross-resource querying and shaping, consider a GraphQL facade instead of growing an ad-hoc query language.
- Search (free text, relevance) is different from filtering; model it as its own endpoint or resource if needed.

## Batch and bulk operations (general knowledge)
- If consumers loop over single-item calls (N+1 calls), offer a batch read (`GET /attendees?ids=…` or `POST /attendees:batchGet`) with a size limit.
- Bulk writes need explicit semantics: all-or-nothing vs per-item results. Return a per-item status array for partial success; don't hide failures behind a single 200.
- Large exports are better as asynchronous jobs (202 + status resource + download link) than as giant responses.

## Review questions
1. Is every list endpoint in an extensible envelope?
2. Is pagination present (or planned without a shape change), with a maximum page size?
3. Is ordering deterministic?
4. Is the filter/sort convention one standard, applied consistently and documented?
5. Can a client cause an unbounded or very expensive query?
