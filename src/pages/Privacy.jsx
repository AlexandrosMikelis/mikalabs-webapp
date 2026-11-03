import { Hero, Footer, EMAIL } from '../components/Layout.jsx'

const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

export default function Privacy() {
  return (
    <>
      <Hero short>
        <div className="herobody left">
          <span className="eyebrow">Privacy</span>
          <h1>Your data on this site.</h1>
          <p>Short version: no cookies, no analytics, no tracking, no forms. We only get your details if you email us or book a call.</p>
        </div>
      </Hero>

      <main className="privacy wrap">
        <div className="doc">
          <p className="updated">Last updated: 3 November 2026</p>

          <section>
            <h2>Who is responsible</h2>
            <p><b>MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.</b> (MIKA LABS SINGLE MEMBER P.C.), Γ.Ε.ΜΗ. 196695102000, Α.Φ.Μ. 803427107, Athens, Greece, is the data controller for this website.</p>
            <p>For any privacy question or request, email <Mail />.</p>
          </section>

          <section>
            <h2>What happens when you visit</h2>
            <ul>
              <li><b>No cookies.</b> The site sets no cookies and uses no local storage.</li>
              <li><b>No analytics or tracking.</b> No Google Analytics, no pixels, no ad networks.</li>
              <li><b>Fonts are hosted here.</b> We don't load fonts from Google or any other third party.</li>
              <li><b>Hosting.</b> The site is hosted on GitHub Pages (GitHub, Inc.). Like any web server, GitHub receives your IP address and browser details to deliver the page and keep the service secure. We don't get access to these logs. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub's privacy statement</a>.</li>
            </ul>
          </section>

          <section>
            <h2>If you email us</h2>
            <p>We receive your email address, name and whatever you write. We use it only to reply and, if we work together, to handle that work. Legal basis: taking steps at your request before a contract, or our legitimate interest in answering messages (GDPR Art. 6(1)(b) and (f)).</p>
            <p>We keep correspondence for as long as needed for that purpose, and longer only where Greek tax or accounting law requires it.</p>
          </section>

          <section id="booking">
            <h2>If you book a call</h2>
            <p>Nothing from Google loads until you click <b>Book an appointment</b>. After you click, the booking calendar is provided by Google Calendar, so Google receives your IP address and the details you enter (name, email, time). Google may process this data outside the EU, under the EU Commission's standard contractual clauses and the EU–US Data Privacy Framework. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google's privacy policy</a>.</p>
            <p>We receive your name, email and chosen time to hold the meeting. Google Meet details are added to the invitation. We delete booking details once they're no longer needed.</p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>Under the GDPR you can ask us to access, correct or delete your data, to restrict or object to its use, or to receive it in a portable format. Email <Mail /> and we'll reply within one month.</p>
            <p>You can also complain to the Hellenic Data Protection Authority (<a href="https://www.dpa.gr" target="_blank" rel="noopener">dpa.gr</a>).</p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>If the site starts using cookies, analytics or forms, we'll update this page first.</p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
