import { useState } from "react";
import ModuleBackButton from "../../components/ModuleBackButton";

import {
  BriefcaseBusiness,
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  LoaderCircle,
  Copy,
  Check,
  FileText,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight
} from "lucide-react";

import api from "../../services/api";
import "./JobMatching.css";

const SAMPLE_JDS = [
  {
    title: "Python Backend Developer",
    text: "We are seeking a talented Python Developer to join our growing engineering team. Must have strong experience in Python, Object-Oriented Programming (OOP), FastAPI, Django or Flask, REST APIs, and database design with PostgreSQL or MongoDB. Experience with Git, Docker, and unit testing is preferred. Freshers with solid programming fundamentals and problem-solving skills are encouraged to apply."
  },
  {
    title: "Full Stack Engineer (React + Node)",
    text: "Looking for an enthusiastic Full Stack Developer skilled in JavaScript, TypeScript, React.js, Node.js, Express, HTML5, CSS3/Tailwind CSS, and MongoDB. Candidates should be capable of designing intuitive user interfaces, creating resilient RESTful APIs, integrating authentication, and maintaining Git repositories."
  },
  {
    title: "Junior Data Analyst",
    text: "Seeking a Junior Data Analyst proficient in Python, SQL, Excel, and data visualization tools like Power BI or Tableau. Candidate should understand descriptive statistics, database querying, data cleaning, and creating insightful analytical reports for business stakeholders."
  }
];

function JobMatching() {
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [activeTab, setActiveTab] = useState("breakdown"); // breakdown, cover_letter, keywords

  const handleMatch = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!resumeId.trim() || !jobDescription.trim()) {
      setError("Please enter Resume ID and Job Description.");
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError("Job Description must contain at least 50 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/job-matching/", {
        resume_id: resumeId.trim(),
        job_description: jobDescription.trim(),
      });

      if (response.data?.success) {
        setResult(response.data);
      } else {
        setError(response.data?.message || "Job matching failed.");
      }
    } catch (err) {
      console.error("Job Matching Error:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Invalid input").join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to complete job matching. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.result;

  const matchedSkills = Array.isArray(analysis?.matched_skills)
    ? analysis.matched_skills
    : [];

  const missingSkills = Array.isArray(analysis?.missing_skills)
    ? analysis.missing_skills
    : [];


  const matchedKeywords = Array.isArray(analysis?.matched_keywords)
    ? analysis.matched_keywords
    : [];

  const suggestions = Array.isArray(analysis?.suggestions)
    ? analysis.suggestions
    : [];

  const score = Math.max(
    0,
    Math.min(100, Number(analysis?.compatibility_score) || 0)
  );

  const getScoreColor = (val) => {
    if (val >= 75) return "#10b981";
    if (val >= 50) return "#f59e0b";
    return "#ef4444";
  };

  // Automated smart tailored cover letter
  const generateCoverLetterText = () => {
    return `Dear Hiring Manager,

I am writing to express my strong enthusiasm for this opportunity. Having closely reviewed your job description and required competencies, I believe my background in ${matchedSkills.slice(0, 4).join(", ") || "software engineering and modern technologies"} aligns well with your team's objectives.

Key Highlights of My Experience:
• Hands-on proficiency in ${matchedSkills.join(", ") || "core technical domains"}.
• Demonstrated ability to build, debug, and deliver clean, scalable solutions.
• Fast learner currently expanding practical exposure in ${missingSkills.slice(0, 2).join(" & ") || "advanced industry best practices"}.

I am eager to contribute to your ongoing projects and look forward to discussing how my skill set can benefit your organization.

Sincerely,
Candidate`;
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(generateCoverLetterText());
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2500);
  };

  return (
    <div className="job-matching-page">
      <ModuleBackButton />

      <header className="jm-header">
        <div className="jm-header-content">
          <span className="jm-eyebrow">
            <Sparkles size={16} /> AI TARGETED MATCHING
          </span>
          <h1>AI Job Compatibility Engine</h1>
          <p>
            Match your resume against any job description with deep keyword analysis, 
            skill gap detection, fit metrics, and instant custom cover letters.
          </p>
        </div>

        <div className="jm-header-badge">
          <Target size={30} />
        </div>
      </header>

      <div className="jm-layout">
        {/* Input Form Card */}
        <section className="jm-form-card">
          <div className="jm-card-title">
            <div className="jm-icon-pill">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <h2>Job Match Setup</h2>
              <p>Enter your resume ID and paste the job description.</p>
            </div>
          </div>

          <form onSubmit={handleMatch}>
            <div className="jm-field">
              <div className="jm-label-row">
                <label htmlFor="resumeId">Resume ID *</label>
                <span className="jm-hint">From Resume Analyzer report</span>
              </div>
              <input
                id="resumeId"
                type="text"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                placeholder="e.g. 6b0559292d66e46d52e65117"
                required
              />
            </div>

            <div className="jm-field">
              <div className="jm-label-row">
                <label htmlFor="jobDescription">Target Job Description *</label>
                <span className="jm-char-count">{jobDescription.length} chars</span>
              </div>
              <textarea
                id="jobDescription"
                rows="6"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description, responsibilities, and qualifications..."
                required
              />
            </div>

            {/* Quick Sample JD Buttons */}
            <div className="jm-sample-jds">
              <span className="jm-sample-title">Quick Try Samples:</span>
              <div className="jm-sample-chips">
                {SAMPLE_JDS.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setJobDescription(sample.text)}
                    className="jm-chip-btn"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="jm-error-banner">
                <XCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="jm-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="jm-spin" size={19} />
                  Analyzing Match & Keywords...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Calculate Match Score
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Info / Value Card */}
        <section className="jm-info-card">
          <div className="jm-info-icon-box">
            <Sparkles size={26} />
          </div>
          <h2>Recruiter Compatibility Benchmark</h2>
          <p>
            Over 80% of corporate recruiters run resumes through ATS scanners before human eyes see them.
          </p>

          <div className="jm-metric-points">
            <div className="jm-point">
              <CheckCircle2 size={18} className="jm-check" />
              <div>
                <strong>Semantic Skill Intersect</strong>
                <span>Calculates hard & soft skill intersection against company JD.</span>
              </div>
            </div>
            <div className="jm-point">
              <CheckCircle2 size={18} className="jm-check" />
              <div>
                <strong>Keyword Density Match</strong>
                <span>Scans for technical terms, frameworks, and role responsibilities.</span>
              </div>
            </div>
            <div className="jm-point">
              <CheckCircle2 size={18} className="jm-check" />
              <div>
                <strong>Instant Tailored Cover Letter</strong>
                <span>Generates an application pitch based on your matched competencies.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MATCH RESULTS SECTION */}
      {analysis && (
        <section className="jm-results-wrapper">
          {/* Top Score Banner */}
          <div className="jm-score-banner">
            <div className="jm-gauge-box">
              <div
                className="jm-circular-score"
                style={{
                  background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #1e293b 0deg)`
                }}
              >
                <div className="jm-circular-inner">
                  <span className="jm-big-num" style={{ color: getScoreColor(score) }}>
                    {score}%
                  </span>
                  <span className="jm-score-sub">Match</span>
                </div>
              </div>
            </div>

            <div className="jm-score-details">
              <span className="jm-match-pill" style={{ borderColor: getScoreColor(score), color: getScoreColor(score) }}>
                {score >= 75 ? "★ Highly Compatible" : score >= 50 ? "● Moderate Alignment" : "▲ Skill Gap Identified"}
              </span>
              <h2>Overall Role Compatibility Score</h2>
              <p>
                {score >= 75
                  ? "Outstanding match! Your profile satisfies the majority of key skills and keywords required by this job."
                  : score >= 50
                  ? "Good baseline alignment. Adding a few missing skills or rephrasing project experiences will significantly increase chances."
                  : "Key skills are missing from your resume compared to this job description. Consider brushing up on high-priority missing technologies."}
              </p>

              <div className="jm-stats-mini-row">
                <div className="jm-mini-stat">
                  <strong>{matchedSkills.length}</strong>
                  <span>Skills Matched</span>
                </div>
                <div className="jm-mini-stat">
                  <strong>{missingSkills.length}</strong>
                  <span>Missing Skills</span>
                </div>
                <div className="jm-mini-stat">
                  <strong>{matchedKeywords.length}</strong>
                  <span>Keywords Aligned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="jm-tabs-bar">
            <button
              type="button"
              className={activeTab === "breakdown" ? "active" : ""}
              onClick={() => setActiveTab("breakdown")}
            >
              <Layers size={16} /> Skill Breakdown
            </button>
            <button
              type="button"
              className={activeTab === "keywords" ? "active" : ""}
              onClick={() => setActiveTab("keywords")}
            >
              <Target size={16} /> Keyword Analysis
            </button>
            <button
              type="button"
              className={activeTab === "cover_letter" ? "active" : ""}
              onClick={() => setActiveTab("cover_letter")}
            >
              <FileText size={16} /> Tailored Cover Letter
            </button>
          </div>

          {/* TAB 1: BREAKDOWN */}
          {activeTab === "breakdown" && (
            <div className="jm-tab-content">
              <div className="jm-skills-grid">
                {/* Matched Skills Card */}
                <div className="jm-skill-box jm-box-matched">
                  <div className="jm-box-head">
                    <CheckCircle2 size={18} className="jm-green" />
                    <h3>Matched Skills ({matchedSkills.length})</h3>
                  </div>
                  <p>Skills present in both your resume and the job description.</p>
                  <div className="jm-tag-cloud">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill, i) => (
                        <span key={i} className="jm-tag jm-tag-green">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="jm-empty-msg">No direct skill matches detected.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills Card */}
                <div className="jm-skill-box jm-box-missing">
                  <div className="jm-box-head">
                    <XCircle size={18} className="jm-red" />
                    <h3>Missing Requirements ({missingSkills.length})</h3>
                  </div>
                  <p>Skills required by the job that were not detected in your resume.</p>
                  <div className="jm-tag-cloud">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill, i) => (
                        <span key={i} className="jm-tag jm-tag-red">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="jm-empty-msg">Congratulations! No critical skills missing.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions Section */}
              {suggestions.length > 0 && (
                <div className="jm-suggestions-card">
                  <div className="jm-box-head">
                    <TrendingUp size={18} className="jm-purple" />
                    <h3>Optimization Suggestions</h3>
                  </div>
                  <ul className="jm-suggestions-list">
                    {suggestions.map((item, i) => (
                      <li key={i}>
                        <ArrowRight size={14} className="jm-arrow" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KEYWORDS */}
          {activeTab === "keywords" && (
            <div className="jm-tab-content">
              <div className="jm-keywords-card">
                <div className="jm-box-head">
                  <Target size={18} className="jm-blue" />
                  <h3>Matched Job Keywords ({matchedKeywords.length})</h3>
                </div>
                <p>
                  These key terminology and industry terms appear in your resume, 
                  helping ATS keyword filters rank you favorably.
                </p>
                <div className="jm-tag-cloud">
                  {matchedKeywords.length > 0 ? (
                    matchedKeywords.map((kw, i) => (
                      <span key={i} className="jm-tag jm-tag-blue">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="jm-empty-msg">No common keywords detected.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COVER LETTER */}
          {activeTab === "cover_letter" && (
            <div className="jm-tab-content">
              <div className="jm-cover-card">
                <div className="jm-cover-head">
                  <div>
                    <h3>AI-Crafted Application Pitch</h3>
                    <p>Tailored specifically around your matched competencies and target role.</p>
                  </div>
                  <button
                    type="button"
                    className="jm-copy-btn"
                    onClick={handleCopyCoverLetter}
                  >
                    {copiedCoverLetter ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCoverLetter ? "Copied to Clipboard!" : "Copy Letter"}
                  </button>
                </div>

                <div className="jm-cover-body">
                  <pre>{generateCoverLetterText()}</pre>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default JobMatching;
