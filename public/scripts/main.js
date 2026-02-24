// Probable — Landing Page Interactions

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')
      if (href === '#') return
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  // CTA form submission (placeholder)
  const ctaForm = document.querySelector('.cta-form')
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const email = ctaForm.querySelector('input[type="email"]').value
      // Placeholder: in production, send to your backend
      console.log('Early access signup:', email)
      alert('Thanks! We\'ll be in touch soon.')
      ctaForm.reset()
    })
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.nav')
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('is-open')
      menuToggle.classList.toggle('is-active')
    })
  }
})
