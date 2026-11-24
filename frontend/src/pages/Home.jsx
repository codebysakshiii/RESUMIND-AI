
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  FileText,
  Target,
  BriefcaseBusiness,
  BrainCircuit,
  Mic,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Zap,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import "../App.css";

const modules = [
  {
    number: "01",
    icon: FileText,
    title: "AI Resume Analyzer",
    description:
      "Analyze your resume with intelligent ATS scoring, detailed feedback and actionable improvements.",
    tag: "RESUME INTELLIGENCE",
  },
  {
    number: "02",
    icon: Target,
    title: "AI Job Matching",
    description:
      "Discover how well your profile matches a job and understand your compatibility.",
    tag: "CAREER MATCHING",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Skill Gap Intelligence",
    description:
      "Identify missing skills and build a personalized roadmap to become job-ready.",
    tag: "SKILL DEVELOPMENT",
  },
  {
    number: "04",
    icon: FileText,
    title: "AI Resume Builder",
    description:
      "Create professional, ATS-friendly resumes with intelligent writing assistance.",
    tag: "SMART CREATION",
  },
  {
    number: "05",
    icon: Mic,
    title: "AI Mock Interview",
    description:
      "Practice interviews, improve your answers and receive structured feedback.",
    tag: "INTERVIEW PREPARATION",
  },
  {
    number: "06",
    icon: Compass,
    title: "Personal AI Career Agent",
    description:
      "Get personalized career guidance, learning recommendations and progress insights.",
    tag: "CAREER COMPANION",
  },
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      {/* NAVBAR */}
      <nav className="navbar">
        <a href="#home" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Sparkles size={21} />
          </span>
          <span>
            resumind<span className="brand-dot">.</span>
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={closeMenu}>Platform</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#modules" onClick={closeMenu}>AI Modules</a>
          <a href="#about" onClick={closeMenu}>About</a>
        </div>

        <div className="nav-actions">
          <Link
            to="/login"
            className="login-btn"
            onClick={closeMenu}
          >
            Log in
          </Link>

          <Link
            to="/signup"
            className="nav-cta"
            onClick={closeMenu}
          >
            Get started <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" />
            YOUR AI-POWERED CAREER INTELLIGENCE
          </div>

          <h1>
            Your next career move
            <br />
            starts with <span>clarity.</span>
          </h1>

          <p className="hero-description">
            Meet your personal career intelligence platform.
            Analyze your resume, discover opportunities and
            build the career you deserve — powered by AI.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="primary-btn">
              Analyze my resume <ArrowRight size={18} />
            </Link>

            <a href="#modules" className="secondary-btn">
              Explore platform <ChevronRight size={17} />
            </a>
          </div>

          <div className="hero-proof">
            <div className="proof-icon">
              <ShieldCheck size={17} />
            </div>
            <span>Built for smarter career decisions</span>
            <span className="proof-separator">·</span>
            <span>One intelligent platform</span>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">
          <div className="dashboard-window">
            <div className="window-top">
              <div className="window-brand">
                <span className="mini-brand">
                  <Sparkles size={13} />
                </span>
                RESUMIND INTELLIGENCE
              </div>

              <span className="window-status">
                <span /> Analysis complete
              </span>
            </div>

            <div className="analysis-heading">
              <div>
                <span className="small-label">RESUME OVERVIEW</span>
                <h3>Your resume report</h3>
                <p>Software Engineer · Resume analysis</p>
              </div>

              <div className="file-icon">
                <FileText size={22} />
              </div>
            </div>

            <div className="score-card">
              <div className="score-info">
                <span className="small-label">OVERALL ATS SCORE</span>

                <div className="score-number">
                  86<span>/100</span>
                </div>

                <span className="score-positive">
                  <CheckCircle2 size={13} /> Strong profile
                </span>
              </div>

              <div className="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle
                    className="ring-bg"
                    cx="60"
                    cy="60"
                    r="48"
                  />
                  <circle
                    className="ring-progress"
                    cx="60"
                    cy="60"
                    r="48"
                  />
                </svg>

                <div className="ring-center">
                  <Sparkles size={22} />
                </div>
              </div>
            </div>

            <div className="analysis-details">
              <div className="detail-heading">
                <span>Resume breakdown</span>
                <span>AI evaluation</span>
              </div>

              {[
                ["Skills relevance", 92],
                ["Experience", 84],
                ["Formatting", 88],
                ["Keyword match", 78],
              ].map(([label, value]) => (
                <div className="progress-item" key={label}>
                  <div className="progress-label">
                    <span>{label}</span>
                    <strong>{value}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-insight">
              <div className="insight-icon">
                <Sparkles size={16} />
              </div>

              <div>
                <strong>AI insight</strong>
                <p>
                  Your technical skills are strong. Improve measurable
                  achievements to strengthen your profile.
                </p>
              </div>
            </div>
          </div>

          <div className="floating-card floating-top">
            <div className="floating-icon">
              <Zap size={17} />
            </div>
            <div>
              <strong>AI powered</strong>
              <span>Career insights</span>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <div className="floating-icon green">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <strong>Job ready</strong>
              <span>Know your next step</span>
            </div>
          </div>
        </div>

        <div className="hero-bottom-label">
          <span>01 / INTELLIGENT CAREER PLATFORM</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip" id="features">
        <span>ONE PLATFORM. SIX INTELLIGENT TOOLS.</span>

        <div><Sparkles size={16} /> Resume intelligence</div>
        <div><Target size={16} /> Career matching</div>
        <div><BrainCircuit size={16} /> Skill development</div>
        <div><BriefcaseBusiness size={16} /> Career growth</div>
      </section>

      {/* AI MODULES */}
      <section className="modules-section" id="modules">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              THE RESUMIND ECOSYSTEM
            </span>

            <h2>
              Everything your career
              <br />
              needs. <span>In one place.</span>
            </h2>
          </div>

          <p>
            Six connected AI capabilities designed to take you
            from understanding your profile to achieving your
            career goals.
          </p>
        </div>

        <div className="modules-grid">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <article className="module-card" key={module.number}>
                <div className="module-card-top">
                  <span className="module-number">
                    {module.number}
                  </span>

                  <span className="module-icon">
                    <Icon size={21} />
                  </span>
                </div>

                <span className="module-tag">{module.tag}</span>

                <h3>{module.title}</h3>

                <p>{module.description}</p>

                <Link to="/signup" className="module-link">
                  Explore module <ArrowUpRight size={17} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="how-intro">
          <span className="section-eyebrow">SIMPLE BY DESIGN</span>

          <h2>
            Your career journey,
            <br />
            <span>made intelligent.</span>
          </h2>

          <p>
            Less guessing. More clarity. A smarter way to move forward.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon"><Upload size={23} /></div>
            <h3>Bring your profile</h3>
            <p>
              Upload your resume and tell us about your career goals.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon"><BrainCircuit size={23} /></div>
            <h3>Let AI understand</h3>
            <p>
              Get intelligent insights about your skills, profile and opportunities.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon"><Compass size={23} /></div>
            <h3>Move forward</h3>
            <p>
              Follow your personalized recommendations and grow with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section" id="get-started">
        <div className="cta-spark">
          <Sparkles size={25} />
        </div>

        <span className="section-eyebrow">
          YOUR NEXT CHAPTER STARTS HERE
        </span>

        <h2>
          Don't just apply.
          <br />
          <span>Apply with confidence.</span>
        </h2>

        <p>
          Make every career decision count with RESUMIND AI.
        </p>

        <Link to="/signup" className="primary-btn cta-button">
          Get started with RESUMIND <ArrowRight size={18} />
        </Link>

        <span className="cta-note">
          Your career. Your potential. Your intelligence.
        </span>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="about">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">
            <Sparkles size={19} />
          </span>

          <span>
            resumind<span className="brand-dot">.</span>
          </span>
        </a>

        <p>Intelligence for your next career move.</p>

        <span>© 2026 RESUMIND AI. All rights reserved.</span>
      </footer>
    </main>
  );
}

export default Home;
