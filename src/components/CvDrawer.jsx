import { useEffect, useRef } from 'react'

const STATS = [
  ['5+', 'years building software'],
  ['TEE', 'licensed engineer'],
  ['3rd', 'Copernicus Hackathon 2020'],
]

const SKILLS = [
  ['AI/ML & agents', ['MCP', 'GraphRAG', 'Neo4j', 'TensorFlow', 'Keras']],
  ['Process modelling', ['ARIS', 'EPC', 'BPMN', 'Value-Added Chain']],
  ['Backend & integration', ['Java', 'Spring Boot', 'Hibernate', 'Apache Camel']],
  ['Infrastructure', ['Docker', 'Jenkins', 'Kibana', 'AWS', 'Windows Server']],
]

const EXPERIENCE = [
  ['Sep 2025 – Now', 'ARIS Administration Engineer', 'Accepted', 'ARIS reporting, portal customisation and server administration. Modelling in EPC, BPMN and Value-Added Chain.'],
  ['Apr 2025 – Sep 2025', 'AI/ML Engineer', 'Icon Platforms', 'Dedicated MCP servers, and a recommendation engine on Neo4j and Spring Boot with TensorFlow/Keras models, on Docker.'],
  ['Apr 2023 – Sep 2025', 'Backend Engineer', 'Icon Platforms', 'REST and SOAP APIs in Java/Hibernate, Apache Camel integrations, Jenkins deployments, Kibana monitoring.'],
  ['Sep 2022 – May 2023', 'R&D', 'Icon Platforms', 'AWS: EC2 and SageMaker for ML experiments, S3, Lambda.'],
  ['Sep 2021 – Sep 2022', 'Frontend Developer', 'Icon Platforms', 'Responsive web apps with Angular, SCSS and TypeScript.'],
  ['Oct 2020 – Mar 2021', 'Machine Learning Developer', 'Dataverse', 'Data collection, labelling and preprocessing across a real ML pipeline.'],
]

const EDUCATION = [
  ['2018 – 2024', 'Integrated Master, ECE', 'University of Patras', '300 ECTS, grade 7.41. Thesis: continuous user authentication from keystroke dynamics with ML.'],
  ['2023', 'Cybersecurity & DevOps', 'Code Hub Regeneration Academy', 'CI/CD, GitOps, Terraform, Azure, Linux.'],
  ['2025', 'Licensed engineer', 'Technical Chamber of Greece (TEE)', 'License of Electrical & Computer Engineering.'],
]

export default function CvDrawer({ onClose }) {
  const closeBtn = useRef(null)

  useEffect(() => {
    const prev = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cv-title">
        <div className="drawer-head">
          <div className="avatar" aria-hidden="true">AM</div>
          <div>
            <h2 id="cv-title">Alexandros Mikelis</h2>
            <span>Founder · Electrical &amp; Computer Engineer</span>
          </div>
          <button ref={closeBtn} className="drawer-close" onClick={onClose} aria-label="Close CV">×</button>
        </div>

        <div className="drawer-body">
          <p className="bio">I build AI agents, backend integrations and process automation, from the model down to the servers it runs on.</p>

          <div className="stats">
            {STATS.map(([b, s]) => <div key={b}><b>{b}</b><span>{s}</span></div>)}
          </div>

          <section>
            <h3 className="sec">Experience</h3>
            <ol className="tl">
              {EXPERIENCE.map(([when, role, org, text]) => (
                <li key={role}><span className="mono">{when}</span><h4>{role}</h4><span className="org">{org}</span><p>{text}</p></li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="sec">Skills</h3>
            <div className="skills">
              {SKILLS.map(([area, tags]) => (
                <div key={area}><h4>{area}</h4><ul className="chips">{tags.map((t) => <li key={t}>{t}</li>)}</ul></div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="sec">Education</h3>
            <ol className="tl">
              {EDUCATION.map(([when, title, org, text]) => (
                <li key={title}><span className="mono">{when}</span><h4>{title}</h4><span className="org">{org}</span><p>{text}</p></li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="sec">Beyond work</h3>
            <p>Greek native, English at IELTS Academic 7.5 (C1–C2). Former coordinator of the IEEE Student Branch programming group in Patras, and an Erasmus+ Youth Exchange participant in Berlin.</p>
          </section>
        </div>
      </aside>
    </>
  )
}
