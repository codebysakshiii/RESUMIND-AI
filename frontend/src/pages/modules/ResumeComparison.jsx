import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  GitCompareArrows,
  FileText,
  Search,
  LoaderCircle,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import "./ResumeComparison.css";

function ResumeComparison() {
  const [resumeId, setResumeId] = useState("");
  const [versions, setVersions] = useState([]);
  const [oldVersionId, setOldVersionId] = useState("");
  const [newVersionId, setNewVersionId] = useState("");
  const [comparison, setComparison] = useState(null);

  const [loadingVersions, setLoadingVersions] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVersions = async () => {
    if (!resumeId.trim()) {
      setError("Please enter your Resume ID.");
      return;
    }

    setLoadingVersions(true);
    setError("");
    setSuccess("");
    setComparison(null);
    setVersions([]);
    setOldVersionId("");
    setNewVersionId("");

    try {
      const response = await api.get(
        `/resume-versions/${resumeId.trim()}`
      );

      const savedVersions = response.data.versions || [];

      setVersions(savedVersions);

      if (savedVersions.length < 2) {
        setError("At least two saved resume versions are required.");
      } else {
        setSuccess(`${savedVersions.length} resume versions loaded successfully!`);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load resume versions. Please check your Resume ID."
      );
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleCompare = async () => {
    if (!resumeId.trim() || !oldVersionId || !newVersionId) {
      setError("Please select both resume versions.");
      return;
    }

    if (oldVersionId === newVersionId) {
      setError("Please select two different versions.");
      return;
    }

    setComparing(true);
    setError("");
    setSuccess("");
    setComparison(null);

    try {
      const response = await api.post("/resume-comparison/", {
        resume_id: resumeId.trim(),
        old_version_id: oldVersionId,
        new_version_id: newVersionId,
      });

      setComparison(response.data.comparison);
      setSuccess("Resume versions compared successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to compare resume versions."
      );
    } finally {
      setComparing(false);
    }
  };

  const formatSectionName = (name) =>
    name.replaceAll("_", " ").replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  
  const renderSection = (title, data) => {
    if (!data) return null;

    return (
      <div className="comparison-section" key={title}>
        <div className="comparison-section-header">
          <h3>{formatSectionName(title)}</h3>
          <span className="section-count">
            {data.old_count} → {data.new_count}
          </span>
        </div>

        <div className="comparison-items">
          <div className="comparison-item-group added-group">
            <h4>
              <PlusCircle size={16} />
              Added ({data.added?.length || 0})
            </h4>

            {data.added?.length > 0 ? (
              data.added.map((item, index) => (
                <div className="comparison-item added-item" key={index}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </div>
              ))
            ) : (
              <p className="empty-change">No items added</p>
            )}
          </div>

          <div className="comparison-item-group removed-group">
            <h4>
              <MinusCircle size={16} />
              Removed ({data.removed?.length || 0})
            </h4>

            {data.removed?.length > 0 ? (
              data.removed.map((item, index) => (
                <div className="comparison-item removed-item" key={index}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </div>
              ))
            ) : (
              <p className="empty-change">No items removed</p>
            )}
          </div>

          <div className="comparison-item-group unchanged-group">
            <h4>
              <CheckCircle2 size={16} />
              Unchanged ({data.unchanged?.length || 0})
            </h4>

            {data.unchanged?.length > 0 ? (
              data.unchanged.map((item, index) => (
                <div className="comparison-item unchanged-item" key={index}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </div>
              ))
            ) : (
              <p className="empty-change">No unchanged items</p>
            )}
          </div>
        </div>
      </div>
    );
  };


  const handleReset = () => {
    setComparison(null);
    setSuccess("");
    setError("");
    setOldVersionId("");
    setNewVersionId("");
  };

  const oldVersion = comparison?.old_version;
  const newVersion = comparison?.new_version;
  const summary = comparison?.summary;
  const changes = comparison?.changes;

  return (
    <div className="resume-comparison-page">
      <ModuleBackButton/>
      
      <div className="comparison-hero">
        <div className="comparison-hero-icon">
          <GitCompareArrows size={30} />
        </div>

        <div>
          <span className="comparison-eyebrow">RESUME INTELLIGENCE</span>
          <h1>Resume Version Comparison</h1>
          <p>
            Compare your saved resume versions and track every
            important change in one place.
          </p>
        </div>
      </div>

      <div className="comparison-card">
        <div className="comparison-card-title">
          <FileText size={21} />
          <div>
            <h2>Select Resume</h2>
            <p>Enter your resume ID to load saved versions.</p>
          </div>
        </div>

        <div className="resume-id-control">
          <input
            type="text"
            placeholder="Enter your Resume ID"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
          />

          <button
            type="button"
            onClick={loadVersions}
            disabled={loadingVersions}
          >
            {loadingVersions ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Search size={18} />
            )}
            Load Versions
          </button>
        </div>

        {error && (
          <div className="comparison-alert error-alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="comparison-alert success-alert">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {versions.length > 0 && (
          <>
            <div className="version-select-grid">
              <div className="version-select-field">
                <label>Old Resume Version</label>
                <select
                  value={oldVersionId}
                  onChange={(e) => {
                    setOldVersionId(e.target.value);
                    setComparison(null);
                  }}
                >
                  <option value="">Select old version</option>
                  {versions.map((version) => (
                    <option
                      key={version.builder_id}
                      value={version.builder_id}
                    >
                      Version {version.version} — {version.target_role || "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="version-arrow">
                <ArrowRight size={24} />
              </div>

              <div className="version-select-field">
                <label>New Resume Version</label>
                <select
                  value={newVersionId}
                  onChange={(e) => {
                    setNewVersionId(e.target.value);
                    setComparison(null);
                  }}
                >
                  <option value="">Select new version</option>
                  {versions.map((version) => (
                    <option
                      key={version.builder_id}
                      value={version.builder_id}
                    >
                      Version {version.version} — {version.target_role || "General"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="compare-action-button"
              onClick={handleCompare}
              disabled={comparing}
            >
              {comparing ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Comparing Versions...
                </>
              ) : (
                <>
                  <GitCompareArrows size={19} />
                  Compare Resume Versions
                </>
              )}
            </button>
          </>
        )}
      </div>

      {comparison && (
        <div className="comparison-results">
          <div className="results-heading">
            <div>
              <span className="comparison-eyebrow">COMPARISON REPORT</span>
              <h2>Your Resume Changes</h2>
              <p>Version {oldVersion?.version} compared with Version {newVersion?.version}</p>
            </div>

            <button
              type="button"
              className="reset-comparison-button"
              onClick={handleReset}
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>

          <div className="version-overview-grid">
            <div className="version-overview-card">
              <span>OLD VERSION</span>
              <h3>Version {oldVersion?.version}</h3>
              <p>{oldVersion?.target_role || "General Role"}</p>
              <small>Template: {oldVersion?.template || "N/A"}</small>
            </div>

            <div className="version-overview-card new-version-card">
              <span>NEW VERSION</span>
              <h3>Version {newVersion?.version}</h3>
              <p>{newVersion?.target_role || "General Role"}</p>
              <small>Template: {newVersion?.template || "N/A"}</small>
            </div>
          </div>

          <div className="comparison-stats-grid">
            <div className="comparison-stat-card">
              <PlusCircle size={22} />
              <strong>{summary?.total_items_added || 0}</strong>
              <span>Items Added</span>
            </div>

            <div className="comparison-stat-card">
              <MinusCircle size={22} />
              <strong>{summary?.total_items_removed || 0}</strong>
              <span>Items Removed</span>
            </div>

            <div className="comparison-stat-card">
              <FileText size={22} />
              <strong>{summary?.sections_compared || 0}</strong>
              <span>Sections Compared</span>
            </div>

            <div className="comparison-stat-card">
              <CheckCircle2 size={22} />
              <strong>
                {[
                  summary?.summary_changed,
                  summary?.personal_information_changed,
                  summary?.target_role_changed,
                  summary?.template_changed,
                ].filter(Boolean).length}
              </strong>
              <span>Other Changes</span>
            </div>
          </div>

          <div className="comparison-section">
            <div className="comparison-section-header">
              <h3>Other Resume Changes</h3>
            </div>

            <div className="other-changes-grid">
              {[
                {
                  title: "Professional Summary",
                  changed: changes?.professional_summary?.changed,
                  old: changes?.professional_summary?.old,
                  new: changes?.professional_summary?.new,
                },
                {
                  title: "Target Role",
                  changed: changes?.target_role?.changed,
                  old: changes?.target_role?.old,
                  new: changes?.target_role?.new,
                },
                {
                  title: "Personal Information",
                  changed: changes?.personal_information?.changed,
                },
                {
                  title: "Resume Template",
                  changed: changes?.template?.changed,
                  old: changes?.template?.old,
                  new: changes?.template?.new,
                },
              ].map((item) => (
                <div className="other-change-card" key={item.title}>
                  <div className="other-change-title">
                    <h4>{item.title}</h4>
                    <span className={item.changed ? "changed-badge" : "same-badge"}>
                      {item.changed ? "Changed" : "Unchanged"}
                    </span>
                  </div>

                  {item.changed && (
                    <div className="change-values">
                      {item.old !== undefined && (
                        <p><strong>Old:</strong> {item.old || "Empty"}</p>
                      )}
                      {item.new !== undefined && (
                        <p><strong>New:</strong> {item.new || "Empty"}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="comparison-sections-list">
            <div className="results-heading">
              <div>
                <h2>Section-by-Section Comparison</h2>
                <p>Review what was added, removed or kept unchanged.</p>
              </div>
            </div>

            {Object.entries(comparison.section_comparison || {}).map(
              ([section, data]) => renderSection(section, data)
            )}
          </div>

          <div className="comparison-note">
            <AlertCircle size={18} />
            <p>{comparison.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeComparison;
