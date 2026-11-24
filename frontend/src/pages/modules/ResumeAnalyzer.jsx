import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserRound,
  Code2,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  TrendingUp,
  Lightbulb,
  ClipboardCheck,
} from "lucide-react";

import api from "../../services/api";
import "./ResumeAnalyzer.css";

function DataValue({ value, depth = 0 }) {
  if (value === null || value === undefined || value === "") {
    return <span className="ra-empty">Not available</span>;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return <span className="ra-empty">No data available</span>;
    }

    return (
      <ul className="ra-data-list">
        {value.map((item, index) => (
          <li key={index}>
            <DataValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    if (depth > 4) {
      return <span>Additional details available</span>;
    }

    return (
      <div className="ra-nested-data">
        {Object.entries(value).map(([key, item]) => (
          <div className="ra-data-row" key={key}>
            <strong>
              {key.replace(/_/g, " ")}
            </strong>
            <DataValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }

  return <span>{String(value)}</span>;
}

function ResultCard({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`ra-card ${className}`}>
      <div className="ra-card-heading">
        <div className="ra-card-icon">
          <Icon size={19} />
        </div>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setFile(null);
      setError("Please select a PDF or DOCX file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("File size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select your resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // Step 1: Upload resume
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const resumeId = uploadResponse.data.resume_id;

      if (!resumeId) {
        throw new Error("Resume upload did not return a resume ID.");
      }

      // Step 2: Analyze uploaded resume
      const analysisResponse = await api.post(
        `/analysis/${resumeId}`
      );

      if (!analysisResponse.data.success) {
        throw new Error("Resume analysis could not be completed.");
      }

      setAnalysis(analysisResponse.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const result = analysis?.result;
  const candidate = result?.candidate || {};
  const score = Math.min(
    100,
    Math.max(0, Number(result?.ats_score || 0))
  );

  const skills = result?.skills || [];

  return (
    <div className="ra-page">
        <ModuleBackButton />
      <div className="ra-header">
        <div>
          <span className="ra-eyebrow">
            <Sparkles size={15} /> RESUME INTELLIGENCE
          </span>

          <h1>AI Resume Analyzer</h1>

          <p>
            Understand your resume quality, identify improvements
            and discover your professional strengths.
          </p>
        </div>
      </div>

      <section className="ra-upload-card">
        <div className="ra-upload-heading">
          <div className="ra-upload-icon">
            <UploadCloud size={25} />
          </div>

          <div>
            <h2>Upload your resume</h2>
            <p>Upload your latest resume for intelligent analysis.</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze}>
          <label className="ra-dropzone">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              disabled={loading}
            />

            <UploadCloud size={34} />

            <strong>
              {file ? file.name : "Choose your resume"}
            </strong>

            <span>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "Click to browse PDF or DOCX"}
            </span>
          </label>

          <div className="ra-upload-footer">
            <span>Maximum file size: 5 MB</span>

            <button
              type="submit"
              className="ra-primary-btn"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="ra-spin" size={17} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="ra-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading && (
          <div className="ra-loading">
            <LoaderCircle className="ra-spin" size={20} />
            <span>
              Uploading your resume and generating analysis...
            </span>
          </div>
        )}
      </section>

      {result && (
        <div className="ra-results">
          <div className="ra-results-heading">
            <div>
              <span className="ra-eyebrow">
                <CheckCircle2 size={15} /> ANALYSIS COMPLETED
              </span>
              <h2>Your Resume Report</h2>
              <p>Here is your resume analysis and improvement report.</p>
            </div>
          </div>

          <section className="ra-overview">
            <div className="ra-score-card">
              <div
                className="ra-score-ring"
                style={{
                  "--score": `${score * 3.6}deg`,
                }}
              >
                <div className="ra-score-inner">
                  <strong>{score}</strong>
                  <span>/ 100</span>
                </div>
              </div>

              <h3>ATS Readiness Score</h3>
              <p>{result.score_type}</p>
            </div>

            <div className="ra-candidate-card">
              <div className="ra-card-heading">
                <div className="ra-card-icon">
                  <UserRound size={19} />
                </div>
                <h3>Candidate Information</h3>
              </div>

              <div className="ra-candidate-details">
                <div>
                  <span>Full Name</span>
                  <strong>{candidate.name || "Not detected"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{candidate.email || "Not detected"}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{candidate.phone || "Not detected"}</strong>
                </div>
              </div>
            </div>
          </section>

          <ResultCard title="Technical Skills" icon={Code2}>
            {skills.length ? (
              <div className="ra-skill-list">
                {skills.map((skill) => (
                  <span className="ra-skill-chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ra-empty">No technical skills detected.</p>
            )}
          </ResultCard>

          <div className="ra-two-column">
            <ResultCard title="Resume Strengths" icon={CheckCircle2}>
              <DataValue value={result.strengths} />
            </ResultCard>

            <ResultCard title="Areas to Improve" icon={TrendingUp}>
              <DataValue value={result.improvements} />
            </ResultCard>
          </div>

          <ResultCard title="Section Quality" icon={ClipboardCheck}>
            <div className="ra-quality-grid">
              {Object.entries(result.section_quality || {}).map(
                ([section, value]) => (
                  <div className="ra-quality-item" key={section}>
                    <div>
                      <strong>{section.replace(/_/g, " ")}</strong>
                      <span>{value}/100</span>
                    </div>

                    <div className="ra-progress-track">
                      <div
                        className="ra-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(value)))}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </ResultCard>

          <div className="ra-two-column">
            <ResultCard title="Education" icon={GraduationCap}>
              <DataValue value={result.education} />
            </ResultCard>

            <ResultCard title="Experience" icon={BriefcaseBusiness}>
              <DataValue value={result.experience} />
            </ResultCard>

            <ResultCard title="Projects" icon={FileText}>
              <DataValue value={result.projects} />
            </ResultCard>

            <ResultCard title="Certifications" icon={Award}>
              <DataValue value={result.certifications} />
            </ResultCard>
          </div>

          <ResultCard title="Summary Improvement" icon={Lightbulb}>
            <DataValue value={result.summary_improvement} />
          </ResultCard>

          <ResultCard title="Project Improvements" icon={TrendingUp}>
            <DataValue value={result.project_improvements} />
          </ResultCard>

          <ResultCard title="Project Metrics" icon={ClipboardCheck}>
            <DataValue value={result.project_metrics} />
          </ResultCard>

          <ResultCard title="Skill Recommendations" icon={Code2}>
            <DataValue value={result.skill_recommendations} />
          </ResultCard>

          <ResultCard title="Quality Recommendations" icon={Lightbulb}>
            <DataValue value={result.quality_recommendations} />
          </ResultCard>

          <ResultCard title="Priority Improvement Checklist" icon={ClipboardCheck}>
            <DataValue value={result.priority_checklist} />
          </ResultCard>

          <div className="ra-report-footer">
            <CheckCircle2 size={17} />
            Resume ID: {analysis.resume_id} (Analysis ID: {analysis.analysis_id})
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
