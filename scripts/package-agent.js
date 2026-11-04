// Packages agents/<name>/ as a provider-neutral zip.
// Adds two generated files so the agent works in any LLM tool, not only Claude:
//   system-prompt.md   SKILL.md without Claude frontmatter, for ChatGPT / Gemini / Copilot / any API
//   <name>-all-in-one.md   system prompt + every reference in one file, for tools that take a single file or paste
// Used by scripts/postbuild.js (production) and the dev server in vite.config.js.
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PREAMBLE = `<!-- Provider-neutral system prompt. Generated from SKILL.md. -->
You have a knowledge base of reference files (references/01 … references/10). They may be attached as files, uploaded as knowledge, or included below this prompt. When these instructions say "read references/NN-…", consult that reference.

`

export function systemPrompt(src) {
  const skill = readFileSync(join(src, 'SKILL.md'), 'utf8').replace(/^---[\s\S]*?---\s*/, '')
  return PREAMBLE + skill
}

export function allInOne(src) {
  const refs = readdirSync(join(src, 'references')).filter((f) => f.endsWith('.md')).sort()
  const parts = refs.map((f) => `\n\n---\n\n<!-- references/${f} -->\n\n` + readFileSync(join(src, 'references', f), 'utf8').trim())
  return systemPrompt(src).trim() + '\n\n---\n\n# Reference files' + parts.join('') + '\n'
}

/** Returns the zip as a Buffer, or writes it to outFile when given. */
export function packageAgent(name, { agentsDir = 'agents', outFile } = {}) {
  const stage = mkdtempSync(join(tmpdir(), 'agent-'))
  try {
    const dir = join(stage, name)
    cpSync(join(agentsDir, name), dir, { recursive: true, filter: (p) => !p.endsWith('.DS_Store') })
    writeFileSync(join(dir, 'system-prompt.md'), systemPrompt(dir))
    writeFileSync(join(dir, `${name}-all-in-one.md`), allInOne(dir))
    // -X: no extra file attributes (owner, macOS metadata) inside the zip
    const args = ['-rqX', outFile ?? '-', name]
    const buf = execFileSync('zip', args, { cwd: stage, maxBuffer: 64 * 1024 * 1024 })
    return outFile ? undefined : buf
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}
