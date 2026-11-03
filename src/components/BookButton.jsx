import { useRef } from 'react'
import { Link } from 'react-router-dom'

const BOOKING_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2uSMRcusasAb9UbEQk8wzUtKJX76tjT8G-LeVEFuwbSoPy_HSFBeieLZFJNJv_6_ADLheidv-x?gv=true'

/* GDPR: Google's scheduling script (and the Google fonts it pulls) loads only after the visitor clicks. */
let scriptState = 'idle' // idle | loading | ready (shared across pages, the script loads once)

export function BookButton({ label = 'Book an appointment', className = 'btn-outline' }) {
  const slot = useRef(null)
  const rendered = useRef(false)

  const fallback = () => window.open(BOOKING_URL, '_blank', 'noopener')

  const openPopup = () => {
    const b = slot.current?.parentNode.querySelector('button')
    if (b) b.click()
    else fallback()
  }

  const render = () => {
    try {
      window.calendar.schedulingButton.load({ url: BOOKING_URL, color: '#635BFF', label: 'Book an appointment', target: slot.current })
      rendered.current = true
      setTimeout(openPopup, 0)
    } catch {
      fallback()
    }
  }

  const onClick = (e) => {
    e.preventDefault()
    if (rendered.current) return openPopup()
    if (scriptState === 'ready') return render()
    if (scriptState === 'loading') return
    scriptState = 'loading'
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://calendar.google.com/calendar/scheduling-button-script.css'
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = 'https://calendar.google.com/calendar/scheduling-button-script.js'
    js.onload = () => { scriptState = 'ready'; render() }
    js.onerror = () => { scriptState = 'idle'; fallback() }
    document.head.appendChild(js)
  }

  return (
    <span className="book">
      <a className={className} href={BOOKING_URL} target="_blank" rel="noopener" onClick={onClick}>{label}</a>
      <span ref={slot} hidden />
    </span>
  )
}

export function BookingNote() {
  return (
    <p className="note">
      Booking opens Google Calendar, so Google receives the details you enter.{' '}
      <Link to="/privacy#booking">How we handle your data</Link>.
    </p>
  )
}
