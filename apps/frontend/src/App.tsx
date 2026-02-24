import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  Download,
  Mail,
  Target,
  Zap,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

interface ForecastData {
  time: string;
  value: number;
  upper: number;
  lower: number;
}

interface Project {
  id: string;
  title: string;
  category: string;
  probability: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  summary: string;
  data: ForecastData[];
}

// --- Mock Data ---

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'UK General Election: Labour Majority Probability',
    category: 'Elections',
    probability: 78,
    trend: 'up',
    lastUpdated: '2 mins ago',
    summary: 'Model updated with latest YouGov polling data. Labour leads by 18 points, translating to a 78% probability of a working majority.',
    data: [
      { time: 'Jan', value: 65, upper: 75, lower: 55 },
      { time: 'Feb', value: 68, upper: 78, lower: 58 },
      { time: 'Mar', value: 72, upper: 82, lower: 62 },
      { time: 'Apr', value: 78, upper: 88, lower: 68 },
    ]
  },
  {
    id: '2',
    title: 'BoE Interest Rate Cut (June 2026)',
    category: 'Macro',
    probability: 42,
    trend: 'down',
    lastUpdated: '1 hour ago',
    summary: 'Inflation undershoot in services sector has stalled. Markets now pricing in a 42% chance of a 25bps cut in June.',
    data: [
      { time: 'Jan', value: 55, upper: 65, lower: 45 },
      { time: 'Feb', value: 50, upper: 60, lower: 40 },
      { time: 'Mar', value: 45, upper: 55, lower: 35 },
      { time: 'Apr', value: 42, upper: 52, lower: 32 },
    ]
  },
  {
    id: '3',
    title: 'Global Semiconductor Supply Index',
    category: 'Supply Chain',
    probability: 89,
    trend: 'stable',
    lastUpdated: '4 hours ago',
    summary: 'Lead times have stabilized across 85% of tracked nodes. High probability of continued recovery through Q3.',
    data: [
      { time: 'Jan', value: 80, upper: 85, lower: 75 },
      { time: 'Feb', value: 82, upper: 87, lower: 77 },
      { time: 'Mar', value: 88, upper: 93, lower: 83 },
      { time: 'Apr', value: 89, upper: 94, lower: 84 },
    ]
  }
];

// --- Components ---

const Navbar = () => (
  <nav className="border-b border-line py-5 px-8 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-ink flex items-center justify-center rounded-xl shadow-lg shadow-slate-200">
        <span className="text-bg font-bold text-lg">P</span>
      </div>
      <span className="font-bold text-xl tracking-tight">Probable<span className="text-muted font-normal">.news</span></span>
    </div>
    <div className="hidden md:flex gap-10 text-[13px] font-semibold tracking-tight text-muted">
      <a href="#projects" className="hover:text-ink transition-colors">Projects</a>
      <a href="#forecasts" className="hover:text-ink transition-colors">Forecasts</a>
      <a href="#methodology" className="hover:text-ink transition-colors">Methodology</a>
      <a href="#pro" className="text-accent-mid font-bold">Probable Pro</a>
    </div>
    <div className="flex items-center gap-4">
      <button className="text-[13px] font-semibold px-4 py-2 hover:text-accent-mid transition-colors">Sign in</button>
      <button className="bg-ink text-white px-5 py-2.5 text-[13px] font-bold rounded-xl hover:shadow-lg hover:shadow-slate-300 transition-all active:scale-95">
        Get started
      </button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-24 pb-32 px-8 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line mb-8">
            <span className="w-2 h-2 bg-accent-mid rounded-full animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Autonomous Data Journalism</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] mb-8 tracking-tight">
            News is a <br />
            <span className="signature-text-gradient">probability.</span>
          </h1>
          <p className="text-xl text-muted max-w-lg mb-12 font-medium leading-relaxed">
            The first autonomous forecasting desk. We transform raw events into structured datasets and calibrated predictions. Serious data for a complex world.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-ink text-white px-8 py-4 text-[15px] font-bold rounded-2xl hover:shadow-2xl hover:shadow-slate-400 transition-all flex items-center gap-2 active:scale-95">
              Explore the desk <ChevronRight size={18} />
            </button>
            <button className="bg-white border border-line px-8 py-4 text-[15px] font-bold rounded-2xl hover:bg-surface transition-all flex items-center gap-2">
              View methodology
            </button>
          </div>
          <div className="mt-12 flex items-center gap-6 opacity-40 grayscale">
            <span className="text-[10px] font-bold uppercase tracking-widest">Trusted by teams at</span>
            <div className="flex gap-8">
              <div className="w-20 h-6 bg-muted/20 rounded-md" />
              <div className="w-20 h-6 bg-muted/20 rounded-md" />
              <div className="w-20 h-6 bg-muted/20 rounded-md" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -top-10 -right-10 w-72 h-72 signature-gradient opacity-20 blur-[100px] rounded-full" />
          <div className="mockup-container animate-float">
            <div className="mockup-header">
              <div className="mockup-dot" />
              <div className="mockup-dot" />
              <div className="mockup-dot" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-inner border border-line/50">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Live Forecast</p>
                  <h3 className="text-2xl font-bold">UK General Election</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Labour Majority</p>
                  <p className="text-4xl font-black signature-text-gradient">78.2%</p>
                </div>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PROJECTS[0].data}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#F59E0B" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorVal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-2 flex-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent-mid w-[78%]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const ProjectRow: React.FC<{ project: Project }> = ({ project }) => (
  <div className="data-row-modern group">
    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-line group-hover:bg-white transition-colors">
      {project.trend === 'up' ? <ArrowUpRight className="text-emerald-500" size={20} /> : 
       project.trend === 'down' ? <ArrowDownRight className="text-rose-500" size={20} /> : 
       <TrendingUp className="text-muted opacity-40" size={20} />}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">{project.category}</span>
      <span className="text-[17px] font-bold tracking-tight group-hover:text-accent-mid transition-colors">{project.title}</span>
    </div>
    <div className="flex flex-col items-end min-w-[120px]">
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Probability</span>
      <span className="text-2xl font-black tracking-tighter">{project.probability}%</span>
    </div>
    <div className="flex items-center gap-4 pl-6 border-l border-line">
      <button className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-line transition-all">
        <ChevronRight size={20} className="text-muted" />
      </button>
    </div>
  </div>
);

const LandingPageForICP: React.FC<{ icp: 'policy' | 'investor' | 'citizen' }> = ({ icp }) => {
  const content = {
    policy: {
      title: "Policy Architects",
      subtitle: "Evidence-based forecasting for legislative impact and risk assessment.",
      features: ["Uncertainty Quantification", "Regional Granularity", "Methodological Transparency"],
      icon: <ShieldCheck size={28} />
    },
    investor: {
      title: "Strategic Investors",
      subtitle: "Alpha through autonomous macro-analysis and real-time risk profiles.",
      features: ["Real-time Risk Profiles", "Scenario Simulations", "Raw Data API Access"],
      icon: <TrendingUp size={28} />
    },
    citizen: {
      title: "Curious Citizens",
      subtitle: "News that respects your intelligence. No punditry, just the data.",
      features: ["Interactive Explainers", "Personalized Alerts", "Calibrated Insights"],
      icon: <Zap size={28} />
    }
  }[icp];

  return (
    <div className="data-card group">
      <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-8 group-hover:signature-gradient group-hover:text-white transition-all duration-500">
        {content.icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{content.title}</h3>
      <p className="text-muted mb-8 font-medium leading-relaxed text-sm">{content.subtitle}</p>
      <ul className="space-y-4 mb-10">
        {content.features.map(f => (
          <li key={f} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-mid" /> {f}
          </li>
        ))}
      </ul>
      <button className="w-full py-4 text-[13px] font-bold rounded-xl border border-line hover:bg-ink hover:text-white transition-all active:scale-[0.98]">
        Learn more
      </button>
    </div>
  );
};

const LeadMagnet = () => (
  <section className="py-32 px-8">
    <div className="max-w-5xl mx-auto rounded-[40px] bg-ink p-12 md:p-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 signature-gradient opacity-20 blur-[120px] -mr-48 -mt-48" />
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-10 backdrop-blur-md">
          <Mail className="text-accent-start" size={28} />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">The Probabilistic Playbook</h2>
        <p className="text-lg text-white/60 mb-12 font-medium leading-relaxed">
          Stop reading headlines. Start reading distributions. Get our 40-page guide on navigating the 2026 cycle using autonomous data journalism.
        </p>
        <form className="flex flex-col md:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Work email address" 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-mid transition-colors"
          />
          <button className="bg-white text-ink px-10 py-4 text-[15px] font-bold rounded-2xl hover:bg-accent-start transition-all active:scale-95">
            Get the guide
          </button>
        </form>
        <p className="mt-8 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
          Join 12,000+ analysts at firms like Goldman Sachs and the UN.
        </p>
      </div>
    </div>
  </section>
);

const EmailSequencePreview = () => (
  <section className="py-32 px-8 bg-surface">
    <div className="max-w-7xl mx-auto">
      <div className="mb-20">
        <p className="text-[11px] font-bold text-accent-mid uppercase tracking-widest mb-3">Invisible Infrastructure</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Nurture Engine</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { 
            step: "01", 
            title: "Onboarding", 
            desc: "A 3-part series introducing the Probable methodology and how to read uncertainty bands.",
            target: "New Subscribers"
          },
          { 
            step: "02", 
            title: "The Deep Dive", 
            desc: "Weekly automated explainers on the Model of the Week—from housing to hyper-inflation.",
            target: "Active Readers"
          },
          { 
            step: "03", 
            title: "The Pro Conversion", 
            desc: "Triggered sequences for high-intent users offering raw CSV exports and API access keys.",
            target: "Power Users"
          }
        ].map(item => (
          <div key={item.step} className="group">
            <span className="text-7xl font-black text-ink/5 block mb-6 group-hover:text-accent-mid/10 transition-colors">{item.step}</span>
            <h4 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h4>
            <p className="text-muted mb-8 font-medium leading-relaxed text-sm">{item.desc}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-line text-muted px-3 py-1.5 rounded-full">{item.target}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-8 border-t border-line bg-white">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-ink flex items-center justify-center rounded-lg">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Probable</span>
        </div>
        <p className="text-sm text-muted leading-relaxed font-medium">
          The first autonomous data journalism desk. Calibrated predictions for a complex world.
        </p>
      </div>
      <div>
        <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-6">Beats</h5>
        <ul className="text-[13px] font-semibold space-y-4 text-muted">
          <li><a href="#" className="hover:text-ink transition-colors">Elections</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Macroeconomy</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Climate</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Sports</a></li>
        </ul>
      </div>
      <div>
        <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-6">Company</h5>
        <ul className="text-[13px] font-semibold space-y-4 text-muted">
          <li><a href="#" className="hover:text-ink transition-colors">About</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Methodology</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">API Docs</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Careers</a></li>
        </ul>
      </div>
      <div>
        <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-6">Connect</h5>
        <ul className="text-[13px] font-semibold space-y-4 text-muted">
          <li><a href="#" className="hover:text-ink transition-colors">Twitter</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">LinkedIn</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Newsletter</a></li>
          <li><a href="#" className="hover:text-ink transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-line flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-muted uppercase tracking-widest">
      <span>© 2026 Probable Media Group</span>
      <div className="flex gap-8">
        <a href="#" className="hover:text-ink">Privacy</a>
        <a href="#" className="hover:text-ink">Terms</a>
        <a href="#" className="hover:text-ink">Ethics</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-accent-mid/30">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />

        {/* Projects Section */}
        <section id="projects" className="py-32 px-8 bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <p className="text-[11px] font-bold text-accent-mid uppercase tracking-widest mb-3">Live Desk</p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Living Data Desk</h2>
              </div>
              <div className="flex p-1.5 bg-white border border-line rounded-2xl">
                {['All', 'Elections', 'Macro', 'Climate'].map(filter => (
                  <button 
                    key={filter} 
                    className={cn(
                      "text-[12px] font-bold px-6 py-2.5 rounded-xl transition-all",
                      filter === 'All' ? "bg-ink text-white shadow-lg shadow-slate-300" : "text-muted hover:text-ink"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-line rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
              {MOCK_PROJECTS.map(project => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <button className="text-[13px] font-bold text-muted hover:text-ink transition-all flex items-center gap-2 mx-auto">
                View all 142 active projects <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ICP Landing Pages Section */}
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center max-w-2xl mx-auto">
              <p className="text-[11px] font-bold text-accent-mid uppercase tracking-widest mb-3">Tailored Intelligence</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Who is Probable for?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <LandingPageForICP icp="policy" />
              <LandingPageForICP icp="investor" />
              <LandingPageForICP icp="citizen" />
            </div>
          </div>
        </section>

        {/* Lead Magnet */}
        <LeadMagnet />

        {/* Email Sequences */}
        <EmailSequencePreview />

        {/* Methodology Teaser */}
        <section id="methodology" className="py-32 px-8 border-t border-line">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: <BarChart3 className="text-accent-mid" size={28} />, title: "Bayesian Priors", desc: "Models start with historical context, not just the latest noise." },
                  { icon: <Target className="text-accent-mid" size={28} />, title: "Calibration", desc: "We track Brier scores in real-time. 70% means 70%." },
                  { icon: <Zap className="text-accent-mid" size={28} />, title: "Low Latency", desc: "RSS to Forecast in under 180 seconds across 400+ feeds." },
                  { icon: <ShieldCheck className="text-accent-mid" size={28} />, title: "Auditable", desc: "Every forecast links back to raw source data and agent logs." }
                ].map((item, i) => (
                  <div key={i} className="bg-surface border border-line rounded-2xl p-8 hover:shadow-lg transition-all">
                    <div className="mb-6">{item.icon}</div>
                    <h5 className="font-bold text-sm mb-2 uppercase tracking-tight">{item.title}</h5>
                    <p className="text-xs text-muted font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-bold text-accent-mid uppercase tracking-widest mb-3">The Engine Room</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Rigorous by design.</h2>
              <p className="text-xl text-muted font-medium mb-10 leading-relaxed">
                We don't just use AI to write stories. We use a network of specialized agents to ingest, clean, model, and narrate data. It's invisible infrastructure for the truth.
              </p>
              <button className="bg-ink text-white px-8 py-4 text-[15px] font-bold rounded-2xl hover:shadow-2xl hover:shadow-slate-400 transition-all flex items-center gap-2 active:scale-95">
                Read the whitepaper <Download size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

