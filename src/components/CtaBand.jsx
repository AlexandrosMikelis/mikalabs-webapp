import { EMAIL } from './Layout.jsx'
import { BookButton, BookingNote } from './BookButton.jsx'

// Closing call to action used at the end of content pages.
export default function CtaBand({ title = 'Not sure where AI fits yet?', text = "Start with a call. Tell us where your team loses the most time, and we'll tell you honestly what is worth automating, what the rules require, and what it takes." }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="btnrow">
          <BookButton label="Book a call" className="btn" />
          <a className="btn-outline" href={`mailto:${EMAIL}`}>Email us</a>
        </div>
      </div>
      <div className="wrap"><BookingNote /></div>
    </section>
  )
}
