# Install Hestia, the Multitenant SaaS Architect

The agent is plain Markdown: a set of instructions plus a knowledge base. It works with any capable LLM.

| File | Use it for |
|---|---|
| `system-prompt.md` | The instructions. Paste into the "instructions" / "system prompt" field of any tool (under 8,000 characters). |
| `references/` (11 files) | The knowledge base. Upload as knowledge / files where the tool allows it. |
| `saas-architect-all-in-one.md` | Instructions + all references in one file, for tools that take a single file or a single long prompt. |
| `SKILL.md` | Claude skill format (same content as `system-prompt.md`, with skill metadata). |
| `agent/saas-architect.md` | Claude Code subagent definition. |

## ChatGPT (Custom GPT)
1. Explore GPTs → Create → Configure.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: upload the 11 files in `references/`.
4. Turn off web browsing if you want answers grounded only in the references.

## Google Gemini (Gem)
1. Gems → New Gem.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: add the files in `references/` (or just `saas-architect-all-in-one.md`).

## Microsoft Copilot (Copilot Studio / agent builder)
1. Create an agent.
2. **Instructions**: paste `system-prompt.md`.
3. **Knowledge**: upload the files in `references/`.

## Claude
- **claude.ai skills**: upload the `saas-architect` folder as a skill.
- **claude.ai Projects**: paste `system-prompt.md` into the project instructions, add `references/` to the project knowledge.
- **Claude Code / Agent SDK**: put the folder in `.claude/skills/saas-architect/` and `agent/saas-architect.md` in `.claude/agents/`. The subagent can read architecture docs, infrastructure code and services in your repository (Read, Grep, Glob only).

## Mistral Le Chat, Perplexity Spaces and other assistants with custom instructions
Paste `system-prompt.md` as the instructions and upload `references/` (or the all-in-one file) as files.

## Local models (Ollama, LM Studio, Open WebUI)
Use `system-prompt.md` as the system prompt and attach the references as a knowledge collection, or use `saas-architect-all-in-one.md` as the system prompt if your model has a context window of 32k tokens or more. Smaller models will follow the output format less reliably.

## APIs and agent frameworks (OpenAI, Anthropic, Google, Azure, AWS Bedrock, LangChain, LlamaIndex, CrewAI, n8n …)
Simplest: send `saas-architect-all-in-one.md` as the system message (about 24k tokens).
Leaner: send `system-prompt.md` as the system message and retrieve the relevant `references/` files with your RAG or file-search tool.

Callers can add optional first-line headers:
```
MODE: design | review | ask
FORMAT: full | structured
CONTEXT: <sector, what a tenant is, tenant count, plans, cloud and platform, jurisdiction, constraints>
```
`FORMAT: structured` returns JSON for designs and reviews, so orchestrator agents can parse the result.
