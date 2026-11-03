import { Hero, Footer, EMAIL } from '../components/Layout.jsx'
import { BookButton, BookingNote } from '../components/BookButton.jsx'
import { Icon } from '../components/Icons.jsx'

const SKILLS = [
  { icon: 'spark', title: 'AI/ML & agents', text: 'MCP servers, customer service chatbots on knowledge graphs and GraphRAG, and recommendation engines.', tags: 'MCP · GraphRAG · Neo4j · TensorFlow · Keras' },
  { icon: 'flow', title: 'Business process modelling', text: 'ARIS reporting and portal customisation for a major customer in the Greek banking sector.', tags: 'ARIS · EPC · BPMN · Value-Added Chain' },
  { icon: 'code', title: 'Backend & integration', text: 'RESTful and SOAP APIs and integration routes built from enterprise integration patterns.', tags: 'Java · Spring Boot · Hibernate · Apache Camel' },
  { icon: 'server', title: 'Infrastructure & operations', text: 'Containerised services, CI/CD, cloud experiments and production monitoring.', tags: 'Docker · Jenkins · Kibana · AWS · Windows Server' },
]

const JOBS = [
  {
    when: 'Sep 2025 – Now',
    roles: [{
      title: 'ARIS Administration Engineer', org: 'Accepted · Athens',
      items: [
        'ARIS reporting and portal customisation for a demanding customer in the Greek banking sector.',
        "Maintenance of ARIS Windows Server 2019 VMs on both the company's and the customer's side.",
        'Modelling in ARIS Modeler, mostly EPCs, BPMN and Value-Added Chain Diagrams.',
      ],
    }],
  },
  {
    when: 'Sep 2021 – Sep 2025',
    roles: [
      { title: 'AI/ML Engineer', org: 'Icon Platforms · Apr 2025 – Sep 2025', items: [
        'Built and maintained dedicated MCP servers for internal and customer-specific use cases.',
        'Built a recommendation engine with Neo4j and Spring Boot, with ML models in TensorFlow and Keras, containerised with Docker.',
      ] },
      { title: 'Backend Engineer', org: 'Icon Platforms · Apr 2023 – Sep 2025', items: [
        'Developed RESTful and SOAP APIs with Java and Hibernate, working from FRDs, high-level and detailed design documents.',
        'Supported deployments via Jenkins and monitored production with Kibana dashboards.',
        'Built integration workflows with Apache Camel for message transformation, routing and orchestration.',
      ] },
      { title: 'R&D', org: 'Icon Platforms · Sep 2022 – May 2023', items: [
        'Hands-on cloud work on AWS: EC2 and SageMaker for ML experiments, S3 for storage, Lambda for serverless functions.',
      ] },
      { title: 'Frontend Developer', org: 'Icon Platforms · Sep 2021 – Sep 2022', items: [
        'Built responsive web applications with Angular, HTML, SCSS and TypeScript.',
      ] },
    ],
  },
  {
    when: 'Oct 2020 – Mar 2021',
    roles: [{ title: 'Machine Learning Developer', org: 'Dataverse · Athens', items: [
      'Collected, analysed, labelled and preprocessed data, and learned the full pipeline of a real-world ML application.',
    ] }],
  },
]

export default function Team() {
  return (
    <>
      <Hero>
        <div className="herobody">
          <span className="member">Founder · MIKA Labs</span>
          <h1>Alexandros Mikelis</h1>
          <p>Electrical &amp; Computer Engineer. I build AI agents, backend integrations and process automation, from the model down to the servers it runs on.</p>
          <div className="ctas">
            <a className="btn" href={`mailto:${EMAIL}`}>Get in touch</a>
            <a className="text" href="#experience">See my experience</a>
          </div>
        </div>
      </Hero>

      <main>
        <section id="skills" className="build wrap">
          <div className="head">
            <span className="eyebrow">What I do</span>
            <h2>AI and the infrastructure under it.</h2>
            <p>Five years across frontend, backend, AI/ML and business process engineering, in Athens.</p>
          </div>
          <div className="caps">
            {SKILLS.map((s) => (
              <article className="cap" key={s.title}>
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <p className="mono">{s.tags}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="exp wrap">
          <div className="head">
            <span className="eyebrow">Experience</span>
            <h2>Where I've worked.</h2>
          </div>
          <div className="jobs">
            {JOBS.map((job) => (
              <article className="job" key={job.when}>
                <span className="when mono">{job.when}</span>
                <div>
                  {job.roles.map((r) => (
                    <div className="role" key={r.title}>
                      <h3>{r.title}</h3>
                      <span className="org">{r.org}</span>
                      <ul>{r.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="education" className="how">
          <div className="wrap">
            <span className="eyebrow">Education &amp; recognition</span>
            <h2>Trained as an engineer, licensed as one.</h2>
            <div className="steps">
              <div className="step"><span className="mono">2018 – 2024</span><h3>Integrated Master, ECE</h3><p>University of Patras. 300 ECTS, grade 7.41. Thesis: continuous user authentication from keystroke dynamics with machine learning.</p></div>
              <div className="step"><span className="mono">2023</span><h3>Cybersecurity &amp; DevOps</h3><p>Code Hub Regeneration Academy. CI/CD, GitOps, Terraform, Microsoft Azure and Linux.</p></div>
              <div className="step"><span className="mono">2020</span><h3>3rd place, Copernicus Hackathon</h3><p>ML software correlating COVID-19 cases with mobility and temperature. <a href="https://www.neanias.eu/index.php/events/activities/110-events-copernicus-hackathon-2020-inathens-results" target="_blank" rel="noopener">Results</a></p></div>
              <div className="step"><span className="mono">2025</span><h3>Licensed engineer</h3><p>License of Electrical &amp; Computer Engineering, Technical Chamber of Greece (TEE).</p></div>
            </div>
          </div>
        </section>

        <section id="contact-me" className="contact wrap">
          <div>
            <span className="eyebrow">Beyond work</span>
            <h2>Let's talk.</h2>
            <p>Greek native, English at IELTS Academic 7.5 (C1–C2). Former coordinator of the IEEE Student Branch programming group in Patras, and an Erasmus+ Youth Exchange participant in Berlin.</p>
            <div className="btnrow">
              <a className="btn" href={`mailto:${EMAIL}`}>Email me</a>
              <BookButton />
            </div>
            <BookingNote />
          </div>
          <div className="fields">
            <div className="field"><span>Email</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
            <div className="field"><span>LinkedIn</span><a href="https://www.linkedin.com/in/alexandros-mikelis-b4a9521a5/" target="_blank" rel="noopener">alexandros-mikelis</a></div>
            <div className="field"><span>Based in</span><b>Athens, Greece</b></div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
