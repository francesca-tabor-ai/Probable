// Probable — Landing Page Interactions

// Chat widget — platform knowledge for conversational AI
const CHAT_KNOWLEDGE = [
  {
    keywords: ['what is probable', 'what\'s probable', 'tell me about probable', 'explain probable'],
    response: "Probable is probabilistic intelligence for teams who make high-stakes decisions under uncertainty. We turn raw data into quantified forecasts, risk distributions, and decision-ready insights—so you stop guessing and start acting on what's likely to happen."
  },
  {
    keywords: ['who is it for', 'who is probable for', 'ideal customer', 'target audience', 'who should use'],
    response: "Probable is built for ops leads, strategy teams, and finance leaders at growth-stage and mid-market companies (Series A–D). If you own revenue targets, resource planning, or product roadmaps—and operate in fast-changing environments—Probable helps you quantify uncertainty and communicate forecasts clearly to leadership and boards."
  },
  {
    keywords: ['how does it work', 'how does probable work', 'how it works', 'get started'],
    response: "It works in three steps:\n\n1. Connect your data — Link spreadsheets, databases, or APIs. Probable learns your patterns without moving your data.\n\n2. Define what matters — Specify the outcomes you care about. We model the uncertainty around each and surface the key drivers.\n\n3. Act on probabilities — Use our dashboards, alerts, and integrations to make decisions backed by real probabilistic estimates."
  },
  {
    keywords: ['problems', 'pain points', 'solve', 'fix', 'issues'],
    response: "Probable tackles four major pain points:\n\n• Single-number forecasts that create false certainty and hide the real range of outcomes\n• Static snapshots that go stale—forcing manual re-work when data changes\n• Scattered tools (spreadsheets, BI, risk models) that don't connect\n• Gut-feel decisions when leadership asks 'how confident are we?' and there's no clear answer\n\nThe result we help avoid: missed targets, misallocated resources, and slower, less confident planning."
  },
  {
    keywords: ['different', 'unique', 'vs competitors', 'better than', 'why probable'],
    response: "Probable is built around probabilistic thinking from the ground up—not a bolt-on to traditional forecasting.\n\nOthers offer point estimates; we offer full probability distributions and confidence intervals. Others give one-off reports; we give real-time forecasts that update as data changes. We integrate risk, scenario, and forecast views in one place—with decision-ready outputs tailored to your workflows."
  },
  {
    keywords: ['get early access', 'sign up', 'start', 'join', 'early access'],
    response: "You can get early access right from this page—scroll to the section above or click 'Get early access' in the nav. Enter your email and we'll be in touch. No credit card required!"
  },
  {
    keywords: ['pricing', 'cost', 'price', 'how much'],
    response: "Pricing details are on our Pricing page—check the navigation for the link. Early access is free and doesn't require a credit card. We'd love to show you how Probable can fit your team."
  },
  {
    keywords: ['data', 'connect', 'integrate', 'sources'],
    response: "Probable connects to your existing data sources—spreadsheets, databases, and APIs—without moving your data. You define the outcomes that matter; we model uncertainty and surface the drivers. The result is forecasts you can trust and explain, not black-box predictions."
  },
  {
    keywords: ['roi', 'results', 'benefits', 'outcomes', 'value'],
    response: "Teams using Probable typically see:\n\n• Faster decisions — Probabilistic estimates reduce back-and-forth and 'what-if' paralysis\n• Fewer surprises — Understanding best and worst case helps you plan contingencies\n• More credible forecasts — Confidence intervals give leadership and investors a clear view of risk\n• Time back — Real-time updates keep forecasts current; less manual re-forecasting\n\nThe ROI comes from better resource allocation, fewer costly misses, and faster cycle times—often paying back within a single planning cycle."
  },
  {
    keywords: ['case stud', 'example', 'customer', 'success'],
    response: "We have case studies that show how teams use Probable—check the 'Case studies' link in the navigation for real examples and outcomes."
  }
]

const CHAT_FALLBACK = "I'm not sure about that specific question yet. Try asking about what Probable is, who it's for, how it works, or what problems it solves. You can also explore the sections above—The problem, The solution, and How it works—for more details!"

function getChatResponse(input) {
  const lower = input.toLowerCase().trim()
  for (const { keywords, response } of CHAT_KNOWLEDGE) {
    if (keywords.some(k => lower.includes(k))) return response
  }
  return CHAT_FALLBACK
}

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

  // Animate progress bar when product mockup enters view
  const productMockup = document.querySelector('.product-mockup')
  const mockupBar = document.querySelector('.mockup-bar-fill')
  if (productMockup && mockupBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mockupBar.style.width = '87%'
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(productMockup)
  }

  // Chat widget
  const chatToggle = document.querySelector('.chat-toggle')
  const chatPanel = document.querySelector('.chat-panel')
  const chatClose = document.querySelector('.chat-close')
  const chatInput = document.querySelector('.chat-input')
  const chatSend = document.querySelector('.chat-send')
  const chatMessages = document.querySelector('.chat-messages')
  const chatProbes = document.querySelectorAll('.chat-probe')

  function openChat() {
    chatPanel.hidden = false
    chatToggle.setAttribute('aria-expanded', 'true')
    chatInput.focus()
  }

  function closeChat() {
    chatPanel.hidden = true
    chatToggle.setAttribute('aria-expanded', 'false')
  }

  function appendMessage(text, isUser) {
    const div = document.createElement('div')
    div.className = `chat-message chat-message-${isUser ? 'user' : 'bot'}`
    const p = document.createElement('p')
    p.textContent = text
    div.appendChild(p)
    chatMessages.appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function showTyping() {
    const div = document.createElement('div')
    div.className = 'chat-message chat-message-bot chat-typing'
    div.innerHTML = '<span></span><span></span><span></span>'
    div.dataset.typing = 'true'
    chatMessages.appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function removeTyping() {
    const typing = chatMessages.querySelector('[data-typing="true"]')
    if (typing) typing.remove()
  }

  function sendMessage(text) {
    if (!text || !text.trim()) return
    const question = text.trim()
    appendMessage(question, true)
    chatInput.value = ''
    showTyping()
    setTimeout(() => {
      removeTyping()
      const response = getChatResponse(question)
      appendMessage(response, false)
    }, 400 + Math.random() * 300)
  }

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => {
      if (chatPanel.hidden) openChat()
      else closeChat()
    })
  }

  if (chatClose && chatPanel) {
    chatClose.addEventListener('click', closeChat)
  }

  if (chatSend && chatInput) {
    chatSend.addEventListener('click', () => sendMessage(chatInput.value))
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        sendMessage(chatInput.value)
      }
    })
  }

  chatProbes.forEach((probe) => {
    probe.addEventListener('click', () => {
      const question = probe.dataset.probe
      if (question) sendMessage(question)
    })
  })
})
