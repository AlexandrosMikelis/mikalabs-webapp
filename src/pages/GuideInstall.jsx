import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'

// Generic version of the INSTALL.md that ships inside every agent zip.
const FILES = [
  ['system-prompt.md', 'The instructions. Paste them into the "instructions" or "system prompt" field of any tool.'],
  ['references/', 'The knowledge base. Upload the files as knowledge where the tool allows it.'],
  ['<agent>-all-in-one.md', 'Instructions and references in one file, for tools that take a single file or one long prompt.'],
  ['SKILL.md · agent/', 'Claude skill and Claude Code subagent formats.'],
]

const TOOLS = [
  ['ChatGPT (Custom GPT)', ['Explore GPTs → Create → Configure.', 'Instructions: paste system-prompt.md.', 'Knowledge: upload the files in references/.', 'Turn off web browsing if answers should come only from the references.']],
  ['Google Gemini (Gem)', ['Gems → New Gem.', 'Instructions: paste system-prompt.md.', 'Knowledge: add the files in references/, or just the all-in-one file.']],
  ['Microsoft Copilot (Copilot Studio)', ['Create an agent.', 'Instructions: paste system-prompt.md.', 'Knowledge: upload the files in references/.']],
  ['Claude', ['claude.ai skills: upload the agent folder as a skill.', 'Claude Projects: paste system-prompt.md into the project instructions and add references/ to the project knowledge.', 'Claude Code: put the folder in .claude/skills/ and the agent/ file in .claude/agents/.']],
  ['Mistral, Perplexity and other assistants', ['Paste system-prompt.md as the instructions.', 'Upload references/ or the all-in-one file as files.']],
  ['Local models (Ollama, LM Studio, Open WebUI)', ['Use system-prompt.md as the system prompt and attach references/ as a knowledge collection.', 'Or use the all-in-one file as the system prompt if your model has a large enough context window. Smaller models follow structured formats less reliably.']],
  ['APIs and agent frameworks', ['Simplest: send the all-in-one file as the system message.', 'Leaner: send system-prompt.md as the system message and retrieve the relevant references/ files with your RAG or file-search tool.']],
]

export default function GuideInstall() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/resources">Resources</Link> / Guide</nav>
          <h1>Install a downloadable agent in any AI tool.</h1>
          <p>Our agents are plain Markdown: a set of instructions plus a knowledge base. That means they work with any capable LLM, not just one provider.</p>
        </div>
      </Hero>

      <main className="privacy wrap">
        <div className="doc">
          <section>
            <h2>What's in the zip</h2>
            <ul>{FILES.map(([f, d]) => <li key={f}><b className="mono">{f}</b> · {d}</li>)}</ul>
            <p>Get agents from the <Link to="/services/ai-agents/store">agent store</Link>.</p>
          </section>
          {TOOLS.map(([t, steps]) => (
            <section key={t}>
              <h2>{t}</h2>
              <ol>{steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </section>
          ))}
          <section>
            <h2>Calling an agent from another agent</h2>
            <p>Agents accept optional headers on the first lines of a request, so other agents and scripts can control the output:</p>
            <pre className="code"><code>{`MODE: review | ask
FORMAT: full | structured
CONTEXT: <sector, jurisdiction, constraints>`}</code></pre>
            <p><b>FORMAT: structured</b> returns JSON, so the result can be parsed by the calling agent.</p>
          </section>
          <section>
            <h2>Menus change</h2>
            <p>AI tools update their menus often. If a step doesn't match what you see, look for the tool's "instructions" and "knowledge" (or "files") settings; the setup is the same idea everywhere.</p>
          </section>
        </div>
      </main>
      <CtaBand title="Need an agent built for your process?" />
      <Footer />
    </>
  )
}
