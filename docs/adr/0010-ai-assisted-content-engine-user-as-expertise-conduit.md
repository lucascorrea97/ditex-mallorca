# Content is produced by an AI-assisted engine; the user is the expertise conduit

The SEO/GEO priority (ADR-0002) depends on substantial, authoritative content. The business staff won't write it and there is no budget for a writer. **Decision:** content is produced by AI agents from raw business expertise, with the user as the conduit — he extracts "how Ditex does X" from the owner/partner and feeds it to agents, who turn it into polished, structured, multilingual articles; he reviews for accuracy and publishes.

## Why

- It's the only model that is both free and capable of the depth GEO requires (LLMs cite specific, expert, well-structured content — generic fluff doesn't get cited).
- It converts the user's situation (a React dev with AI agents on tap, wanting deeper involvement in the business) into a genuine, compounding content moat.
- The foam expertise (ADR-0008) is real and unfakeable — exactly the raw material that makes AI-assisted content authoritative rather than generic.

## Considered Options

- **Minimal content (product pages only)** — rejected: ranks for "ditex" and little else; won't earn LLM citations; contradicts the #1 goal.
- **Hire a writer** — rejected: costs money (free-tier constraint) and a non-expert writer produces generic content anyway.
- **AI-assisted, expertise-fed** (chosen).

## Consequences

- Flagship content = foam/application guides by segment (marine, contract, furniture) + local-intent pages, backed by real know-how and structured data — not a generic blog.
- The pipeline requires periodic ~15-min expertise brain-dumps from the business; the user has committed to driving these.
- Accuracy review by the user (who can check facts with the business) is a required publishing step — AI drafts, human verifies, especially on technical foam/density claims.
