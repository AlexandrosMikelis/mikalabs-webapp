# Install Hermes, the API Design Reviewer

The reviewer is plain Markdown: a set of instructions plus a knowledge base. It works with any capable LLM.

| File | Use it for |
|---|---|
| `system-prompt.md` | The instructions. Paste into the "instructions" / "system prompt" field of any tool (under 8,000 characters). |
| `references/` (10 files) | The knowledge base. Upload as knowledge / files where the tool allows it. |
| `api-design-reviewer-all-in-one.md` | Instructions + all references in one file, for tools that take a single file or a single long prompt. |
| `SKILL.md` | Claude skill format (same content as `system-prompt.md`, with skill metadata). |
| `agent/api-design-reviewer.md` | Claude Code subagent definition (worker tier). |

## ChatGPT (Custom GPT)
1. Explore GPTs → Create → Configure.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: upload the 10 files in `references/`.
4. Turn off web browsing if you want answers grounded only in the references.

## Google Gemini (Gem)
1. Gems → New Gem.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: add the files in `references/` (or just `api-design-reviewer-all-in-one.md`).

## Microsoft Copilot (Copilot Studio / agent builder)
1. Create an agent.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: upload the files in `references/`.

## Claude
- **claude.ai skills**: upload the `api-design-reviewer` folder as a skill.
- **claude.ai Projects**: paste `system-prompt.md` into the project instructions, add `references/` to the project knowledge.
- **Claude Code / Agent SDK**: put the folder in `.claude/skills/api-design-reviewer/` and `agent/api-design-reviewer.md` in `.claude/agents/`. The subagent can read spec files in your repo (read-only tools).

## Mistral Le Chat, Perplexity Spaces and other assistants with custom instructions
Paste `system-prompt.md` as the instructions and upload `references/` (or the all-in-one file) as files.

## Local models (Ollama, LM Studio, Open WebUI)
Use `system-prompt.md` as the system prompt and attach the references as a knowledge collection, or use `api-design-reviewer-all-in-one.md` as the system prompt if your model has a context window of 32k tokens or more (leave room for the spec you paste). Smaller models will follow the review format less reliably.

## APIs and agent frameworks (OpenAI, Anthropic, Google, Azure, AWS Bedrock, LangChain, LlamaIndex, CrewAI, n8n …)
Simplest: send `api-design-reviewer-all-in-one.md` as the system message (about 15k tokens).
Leaner: send `system-prompt.md` as the system message and retrieve the relevant `references/` files with your RAG or file-search tool.

Callers can add optional first-line headers:
```
MODE: review | design | ask
FORMAT: full | structured
CONTEXT: <consumers, internal/public, house API standard, volume>
PREVIOUS: <previous spec version, for breaking-change checks>
```
`FORMAT: structured` returns JSON for reviews, so orchestrator agents can parse the result. Large specs: send the spec as a user message, not inside the system prompt.
