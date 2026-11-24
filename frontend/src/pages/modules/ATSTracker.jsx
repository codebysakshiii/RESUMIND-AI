import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LoaderCircle,
  RefreshCw,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Zap,
  BarChart2
} from "lucide-react";

import api from "../../services/api";
import "./ATSTracker.css";

const PRESET_COMPARISONS = [
  {
    label: "Version 1 vs Version 2 (Score 65 ➔ 85)",
    oldId: "6afece76e7221ed6c71d8a2b",
    newId: "6afed0f0691c1e515f5253f4",
  },
  {
    label: "Version 2 vs Optimized (Score 85 ➔ 100)",
    oldId: "6afed0f0691c1e515f5253f4",
    newId: "6afeccefd2732d58046948d2",
  },
];

function ATSTracker() {
  const [oldAnalysisId, setOldAnalysisId] = useState("");
  const [newAnalysisId, setNewAnalysisId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async (e) => {
    e?.preventDefault();

    setError("");
    setResult(null);

    if (!oldAnalysisId.trim() || !newAnalysisId.trim()) {
      setError("Please enter both analysis IDs.");
      return;
    }

    if (oldAnalysisId.trim() === newAnalysisId.trim()) {
      setError("Old and new analysis IDs must be different.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/ats-tracker/", {
        old_analysis_id: oldAnalysisId.trim(),
        new_analysis_id: newAnalysisId.trim(),
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to calculate ATS score delta. Please check your IDs."
      );
    } finally {
      setLoading(false);
    }
  };

  const delta = result?.result?.ats_score_difference ?? 0;
  const oldScore = result?.result?.old_ats_score ?? 0;
  const newScore = result?.result?.new_ats_score ?? 0;
  const isImproved = delta > 0;
  const isDecreased = delta < 0;

  return (
    <div className="ats-tracker-page">
      <ModuleBackButton />

      <header className="at-header">
        <div className="at-header-content">
          <span className="at-eyebrow">
            <Sparkles size={16} /> RECRUITER ATS EVOLUTION
          </span>
          <h1>ATS Score Improvement Tracker</h1>
          <p>
            Track your ATS score trajectory over time. Compare two resume iterations 
            to see exact score deltas, section improvements, and recruiter readiness gains.
          </p>
        </div>

        <div className="at-header-badge">
          <BarChart2 size={32} />
        </div>
      </header>

      <div className="at-layout">
        {/* Input Form */}
        <section className="at-form-card">
          <div className="at-card-title">
            <div className="at-icon-pill">
              <RefreshCw size={20} />
            </div>
            <div>
              <h2>Compare Iterations</h2>
              <p>Enter the Analysis IDs of your previous and updated resumes.</p>
            </div>
          </div>

          <form onSubmit={handleCompare}>
            <div className="at-field">
              <label htmlFor="oldAnalysisId">Baseline Analysis ID (Previous Version) *</label>
              <input
                id="oldAnalysisId"
                type="text"
                value={oldAnalysisId}
                onChange={(e) => setOldAnalysisId(e.target.value)}
                placeholder="e.g. 6afece76e7221ed6c71d8a2b"
                required
              />
            </div>

            <div className="at-field">
              <label htmlFor="newAnalysisId">Updated Analysis ID (Newest Version) *</label>
              <input
                id="newAnalysisId"
                type="text"
                value={newAnalysisId}
                onChange={(e) => setNewAnalysisId(e.target.value)}
                placeholder="e.g. 6afed0f0691c1e515f5253f4"
                required
              />
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="at-demo-box">
              <span className="at-demo-label">Quick Preset Comparators:</span>
              <div className="at-demo-chips">
                {PRESET_COMPARISONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setOldAnalysisId(preset.oldId);
                      setNewAnalysisId(preset.newId);
                    }}
                    className="at-chip-btn"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="at-error-banner">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="at-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="at-spin" size={18} />
                  Evaluating Progress Delta...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Calculate Score Progress
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Info Box */}
        <section className="at-info-card">
          <div className="at-info-icon-box">
            <Sparkles size={25} />
          </div>
          <h2>Why Tracking ATS Scores Matters</h2>
          <p>
            When applying to competitive roles, optimizing keywords and quantifying 
            project metrics can increase ATS pass-through rates by up to 300%.
          </p>

          <div className="at-feature-list">
            <div className="at-feature-item">
              <CheckCircle2 size={18} className="at-check" />
              <div>
                <strong>A/B Test Resume Variations</strong>
                <span>Discover which project descriptions generate higher scoring baselines.</span>
              </div>
            </div>
            <div className="at-feature-item">
              <CheckCircle2 size={18} className="at-check" />
              <div>
                <strong>Verified Delta Metrics</strong>
                <span>Objective point-by-point feedback showing genuine recruiter progress.</span>
              </div>
            </div>
            <div className="at-feature-item">
              <CheckCircle2 size={18} className="at-check" />
              <div>
                <strong>Target 80+ Threshold</strong>
                <span>Resumes scoring 80+ have a significantly higher rate of HR callbacks.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <section className="at-results-card">
          <div className="at-result-top">
            <div>
              <span className="at-badge-pill">
                <Target size={14} /> EVOLUTION REPORT
              </span>
              <h2>Iteration Comparison Result</h2>
              <p>{result.message || "Detailed score delta successfully analyzed."}</p>
            </div>

            <div
              className={`at-delta-badge ${
                isImproved ? "improved" : isDecreased ? "decreased" : "neutral"
              }`}
            >
              {isImproved ? (
                <TrendingUp size={24} />
              ) : isDecreased ? (
                <TrendingDown size={24} />
              ) : (
                <Minus size={24} />
              )}
              <span>
                {delta > 0 ? `+${delta}` : delta} Points
              </span>
            </div>
          </div>

          {/* Head to Head Visual Meter */}
          <div className="at-comparison-meter-grid">
            <div className="at-meter-card">
              <span className="at-meter-sub">PREVIOUS ITERATION</span>
              <h3 className="at-meter-num">{oldScore}/100</h3>
              <div className="at-track">
                <div
                  className="at-fill at-fill-old"
                  style={{ width: `${Math.min(100, Math.max(0, oldScore))}%` }}
                />
              </div>
              <p className="at-meter-id">ID: {oldAnalysisId}</p>
            </div>

            <div className="at-vs-circle">VS</div>

            <div className="at-meter-card">
              <span className="at-meter-sub">UPDATED ITERATION</span>
              <h3 className="at-meter-num at-meter-green">{newScore}/100</h3>
              <div className="at-track">
                <div
                  className="at-fill at-fill-new"
                  style={{ width: `${Math.min(100, Math.max(0, newScore))}%` }}
                />
              </div>
              <p className="at-meter-id">ID: {newAnalysisId}</p>
            </div>
          </div>

          {/* Recruiter Verdict Box */}
          <div className="at-verdict-box">
            <div className="at-verdict-icon">
              <Award size={24} />
            </div>
            <div>
              <h4>Recruiter Assessment Verdict</h4>
              <p>
                {isImproved
                  ? `Excellent enhancement! Your updated resume gained +${delta} points over the previous draft. This reflects cleaner keyword density, better structural formatting, and higher automated ATS pass-through probability.`
                  : isDecreased
                  ? `Your score decreased by ${Math.abs(delta)} points. Ensure you haven't removed vital technical skills or shortened project accomplishments in the new draft.`
                  : `Your score remained constant at ${newScore}/100. Consider enriching action verbs and measurable metrics to bump your score into the 90+ tier.`}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ATSTracker;
