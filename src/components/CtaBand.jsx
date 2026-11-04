import { EMAIL } from './Layout.jsx'
import { BookButton, BookingNote } from './BookButton.jsx'

// Closing call to action used at the end of content pages.
export default function CtaBand({ title = 'Which process should run itself?', text = "Tell us where your team loses the most time. We'll tell you honestly what can be automated, and what it takes." }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="btnrow">
          <BookButton label="Book a demo" className="btn" />
          <a className="btn-outline" href={`mailto:${EMAIL}`}>Email us</a>
        </div>
      </div>
      <div className="wrap"><BookingNote /></div>
    </section>
  )
}
