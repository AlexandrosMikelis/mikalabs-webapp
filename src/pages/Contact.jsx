import { Hero, Footer, EMAIL } from '../components/Layout.jsx'
import { BookButton, BookingNote } from '../components/BookButton.jsx'

const LINKEDIN = 'https://www.linkedin.com/in/alexandros-mikelis-b4a9521a5/'

export default function Contact() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Contact</span>
          <h1>Let's talk about your processes.</h1>
          <p>Book a 30-minute call or send us an email. Tell us where your team loses the most time, and we'll tell you honestly what can be automated.</p>
        </div>
      </Hero>

      <main>
        <section className="wrap contact-cards contact-only">
          <article className="ccard">
            <span className="eyebrow">Book a demo</span>
            <h2>30-minute video call</h2>
            <p>Pick a time that suits you. We'll look at one of your processes together.</p>
            <BookButton label="Book a demo" className="btn" />
            <BookingNote />
          </article>
          <article className="ccard">
            <span className="eyebrow">Email</span>
            <h2>Write to us</h2>
            <p>Describe the process, the systems involved and roughly how much time it takes today.</p>
            <a className="btn-outline" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <p className="note"><a href={LINKEDIN} target="_blank" rel="noopener">Or find us on LinkedIn</a></p>
          </article>
        </section>

      </main>

      <Footer />
    </>
  )
}
