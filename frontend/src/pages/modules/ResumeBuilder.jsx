import { useState, useRef } from "react";
import ModuleBackButton from "../../components/ModuleBackButton";
import {
  FileText,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  BriefcaseBusiness,
  FolderKanban,
  Camera,
  Trash2,
  Printer,
  Palette,
  Layout,
  Mail,
  Phone,
  Award,
  Globe,
  Share2,
  Check,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import api from "../../services/api";
import "./ResumeBuilder.css";

const COLOR_THEMES = [
  { id: "indigo", name: "Indigo Modern", primary: "#4f46e5", secondary: "#e0e7ff", text: "#1e1b4b" },
  { id: "slate", name: "Executive Slate", primary: "#0f172a", secondary: "#f1f5f9", text: "#0f172a" },
  { id: "emerald", name: "Emerald Tech", primary: "#059669", secondary: "#d1fae5", text: "#064e3b" },
  { id: "ocean", name: "Ocean Blue", primary: "#0284c7", secondary: "#e0f2fe", text: "#0c4a6e" },
  { id: "rose", name: "Creative Berry", primary: "#e11d48", secondary: "#ffe4e6", text: "#881337" },
  { id: "violet", name: "Deep Violet", primary: "#7c3aed", secondary: "#ede9fe", text: "#4c1d95" },
];

const TEMPLATES = [
  { id: "modern", name: "Modern Dynamic", tag: "Photo + Sidebar" },
  { id: "professional", name: "Corporate Professional", tag: "Clean Classic" },
  { id: "minimal", name: "Minimalist ATS", tag: "Strict 100% ATS" },
  { id: "creative", name: "Creative Tech Grid", tag: "Portfolio Style" },
];

function ResumeBuilder() {
  const [resumeId, setResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [template, setTemplate] = useState("modern");
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [photo, setPhoto] = useState(null);
  const [showPhoto, setShowPhoto] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [builderId, setBuilderId] = useState(null);
  const [editableResume, setEditableResume] = useState(null);
  const [fontSize, setFontSize] = useState("normal"); // compact, normal, large
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please select an image smaller than 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhoto(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateResume = async (e) => {
    e.preventDefault();

    if (!resumeId.trim() || !targetRole.trim()) {
      setError("Please enter Resume ID and Target Role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setEditableResume(null);
      setBuilderId(null);

      const response = await api.post("/resume-builder/", {
        resume_id: resumeId.trim(),
        target_role: targetRole.trim(),
        template: template === "minimal" ? "minimal" : template === "modern" ? "modern" : "professional",
      });

      if (response.data.success) {
        setBuilderId(response.data.builder_id);
        const resObj = response.data?.result?.resume;
        setEditableResume(JSON.parse(JSON.stringify(resObj)));
      } else {
        setError(response.data.message || "Resume generation failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to generate resume. Please check your Resume ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBackendPdf = async () => {
    if (!builderId) {
      alert("Please generate your resume first.");
      return;
    }
    try {
      setDownloadingPdf(true);
      const response = await api.get(`/resume-export/${builderId}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${editableResume?.personal_information?.name || "Candidate"}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Backend PDF download failed. You can use 'Print / Save as PDF' instead.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className={`resume-builder-page rb-font-${fontSize}`}>
      <div className="no-print">
        <ModuleBackButton />

        <div className="rb-header">
          <div>
            <span className="rb-eyebrow">
              <Sparkles size={15} /> NEXT-GEN AI CAREER STUDIO
            </span>
            <h1>AI Pro Resume Studio</h1>
            <p>
              Choose from Modern, Professional, Minimalist & Creative templates with live photo upload,
              font sizing, custom accent colors, and dual PDF download options.
            </p>
          </div>

          <div className="rb-header-icon">
            <FileText size={35} />
          </div>
        </div>

        <div className="rb-layout">
          {/* Left Form Box */}
          <section className="rb-form-card">
            <div className="rb-card-heading">
              <div className="rb-icon-box">
                <BriefcaseBusiness size={21} />
              </div>
              <div>
                <h2>Configuration & Input</h2>
                <p>Provide your target job role and styling options.</p>
              </div>
            </div>

            <form onSubmit={generateResume}>
              <div className="rb-field-group">
                <label>Resume ID *</label>
                <input
                  type="text"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  placeholder="Example: 6b0559292d66e46d52e65117"
                  required
                />
                <span className="rb-help-text">
                  Tip: Get this from the Resume Analyzer page.
                </span>
              </div>

              <div className="rb-field-group">
                <label>Target Job Role *</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Example: Python Developer / Full Stack Engineer"
                  required
                />
              </div>

              {/* Template Pre-Select */}
              <div className="rb-field-group">
                <label>Select Template Style</label>
                <div className="rb-template-grid-select">
                  {TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className={`rb-template-option-card ${template === tmpl.id ? "selected" : ""}`}
                      onClick={() => setTemplate(tmpl.id)}
                    >
                      <div className="rb-tmpl-name">{tmpl.name}</div>
                      <div className="rb-tmpl-tag">{tmpl.tag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="rb-photo-section">
                <label className="rb-photo-label">
                  <Camera size={16} /> Professional Profile Photo (Optional)
                </label>
                <div className="rb-photo-controls">
                  {photo ? (
                    <div className="rb-photo-preview-wrap">
                      <img src={photo} alt="Profile Preview" className="rb-photo-thumb" />
                      <button
                        type="button"
                        className="rb-remove-photo-btn"
                        onClick={removePhoto}
                        title="Remove photo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="rb-photo-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <User size={22} />
                      <span>Upload Profile Photo</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />

                  {photo && (
                    <label className="rb-toggle-wrap">
                      <input
                        type="checkbox"
                        checked={showPhoto}
                        onChange={(e) => setShowPhoto(e.target.checked)}
                      />
                      <span>Show in resume</span>
                    </label>
                  )}
                </div>
              </div>

              {error && (
                <div className="rb-error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="rb-generate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="rb-spin" size={19} />
                    Crafting Smart Resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} />
                    Generate AI Resume
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Right Info Box */}
          <section className="rb-info-card">
            <div className="rb-info-icon">
              <Sparkles size={25} />
            </div>
            <h2>Modern, Professional & Minimalist</h2>
            <p>
              Industry research-backed layouts crafted to stand out to recruiters and pass ATS scanners.
            </p>

            <div className="rb-feature-list">
              <div className="rb-feature">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Modern Dynamic</strong>
                  <span>Photo avatar + high-converting sidebar for skills & education.</span>
                </div>
              </div>
              <div className="rb-feature">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Corporate Professional</strong>
                  <span>Classic corporate header, colored divider and elegant typography.</span>
                </div>
              </div>
              <div className="rb-feature">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Minimalist ATS Pro</strong>
                  <span>Standard top-down layout ideal for tech companies & corporate portals.</span>
                </div>
              </div>
              <div className="rb-feature">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Creative Tech Grid</strong>
                  <span>Showcases technical projects with skill badges and clean framing.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Generated Resume Section */}
      {editableResume && (
        <section className="rb-result-wrapper">
          {/* Customization Toolbar */}
          <div className="rb-toolbar no-print">
            <div className="rb-toolbar-group">
              <span className="rb-toolbar-title">
                <Layout size={16} /> Template:
              </span>
              <div className="rb-pill-selector">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    className={template === tmpl.id ? "active" : ""}
                    onClick={() => setTemplate(tmpl.id)}
                  >
                    {tmpl.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rb-toolbar-group">
              <span className="rb-toolbar-title">
                <Palette size={16} /> Color:
              </span>
              <div className="rb-color-selector">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`rb-color-dot ${colorTheme.id === theme.id ? "selected" : ""}`}
                    style={{ backgroundColor: theme.primary }}
                    onClick={() => setColorTheme(theme)}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <div className="rb-toolbar-group">
              <span className="rb-toolbar-title">Font Size:</span>
              <div className="rb-pill-selector">
                <button
                  type="button"
                  className={fontSize === "compact" ? "active" : ""}
                  onClick={() => setFontSize("compact")}
                  title="Fit more content on 1 page"
                >
                  <ZoomOut size={13} /> Compact
                </button>
                <button
                  type="button"
                  className={fontSize === "normal" ? "active" : ""}
                  onClick={() => setFontSize("normal")}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={fontSize === "large" ? "active" : ""}
                  onClick={() => setFontSize("large")}
                >
                  <ZoomIn size={13} /> Large
                </button>
              </div>
            </div>

            <div className="rb-toolbar-actions">
              <button
                type="button"
                className="rb-action-btn-secondary"
                onClick={handleShare}
                title="Copy shareable link"
              >
                {copiedLink ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
                {copiedLink ? "Link Copied!" : "Share"}
              </button>

              <button
                type="button"
                className="rb-action-btn-secondary"
                onClick={handleDownloadBackendPdf}
                disabled={downloadingPdf}
                title="Download backend generated PDF"
              >
                <Download size={16} />
                {downloadingPdf ? "Exporting..." : "ATS PDF"}
              </button>

              <button
                type="button"
                className="rb-print-btn"
                onClick={handlePrint}
                title="High-resolution direct vector print"
              >
                <Printer size={17} />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Paper View Container */}
          <div className="rb-preview-stage">
            <div
              className={`rb-paper template-${template}`}
              id="printable-resume"
              style={{
                "--primary-color": colorTheme.primary,
                "--secondary-color": colorTheme.secondary,
                "--text-color": colorTheme.text,
              }}
            >
              {/* 1. MODERN DYNAMIC (SIDEBAR) */}
              {template === "modern" && (
                <div className="rb-layout-sidebar">
                  <aside className="rb-sidebar-left">
                    {showPhoto && photo && (
                      <div className="rb-avatar-container">
                        <img src={photo} alt="Profile" className="rb-avatar-img" />
                      </div>
                    )}

                    <div className="rb-sidebar-section">
                      <h3 className="rb-sidebar-heading">CONTACT INFO</h3>
                      <div className="rb-contact-item">
                        <Mail size={13} />
                        <span>{editableResume.personal_information?.email || "email@example.com"}</span>
                      </div>
                      {editableResume.personal_information?.phone && (
                        <div className="rb-contact-item">
                          <Phone size={13} />
                          <span>{editableResume.personal_information?.phone}</span>
                        </div>
                      )}
                      <div className="rb-contact-item">
                        <Globe size={13} />
                        <span>linkedin.com/in/profile</span>
                      </div>
                    </div>

                    <div className="rb-sidebar-section">
                      <h3 className="rb-sidebar-heading">TECHNICAL SKILLS</h3>
                      <div className="rb-sidebar-skills">
                        {editableResume.technical_skills?.map((skill, i) => (
                          <span key={i} className="rb-sidebar-skill-badge">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {editableResume.education?.length > 0 && (
                      <div className="rb-sidebar-section">
                        <h3 className="rb-sidebar-heading">EDUCATION</h3>
                        {editableResume.education.map((edu, i) => (
                          <div key={i} className="rb-sidebar-edu-item">
                            <p>{edu}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </aside>

                  <main className="rb-sidebar-main">
                    <div className="rb-main-hero">
                      <h1 className="rb-candidate-title">
                        {editableResume.personal_information?.name || "Candidate Name"}
                      </h1>
                      <h2 className="rb-target-role-badge">
                        {editableResume.target_role || targetRole}
                      </h2>
                    </div>

                    <div className="rb-main-section">
                      <h3 className="rb-main-heading">
                        <User size={16} /> PROFESSIONAL SUMMARY
                      </h3>
                      <p className="rb-summary-text">
                        {editableResume.professional_summary}
                      </p>
                    </div>

                    <div className="rb-main-section">
                      <h3 className="rb-main-heading">
                        <FolderKanban size={16} /> KEY PROJECTS
                      </h3>
                      <div className="rb-projects-stream">
                        {editableResume.projects?.map((project, i) => (
                          <div key={i} className="rb-project-card">
                            <div className="rb-project-card-header">
                              <h4>{project.title}</h4>
                            </div>
                            <p className="rb-project-desc">{project.description}</p>
                            {project.technologies?.length > 0 && (
                              <div className="rb-project-techs">
                                <strong>Technologies: </strong>
                                <span>{project.technologies.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {editableResume.experience?.length > 0 && (
                      <div className="rb-main-section">
                        <h3 className="rb-main-heading">
                          <BriefcaseBusiness size={16} /> WORK EXPERIENCE
                        </h3>
                        {editableResume.experience.map((exp, i) => (
                          <p key={i} className="rb-exp-item">
                            {typeof exp === "string" ? exp : JSON.stringify(exp)}
                          </p>
                        ))}
                      </div>
                    )}

                    {editableResume.certifications?.length > 0 && (
                      <div className="rb-main-section">
                        <h3 className="rb-main-heading">
                          <Award size={16} /> CERTIFICATIONS
                        </h3>
                        {editableResume.certifications.map((cert, i) => (
                          <p key={i} className="rb-cert-item">
                            {typeof cert === "string" ? cert : JSON.stringify(cert)}
                          </p>
                        ))}
                      </div>
                    )}
                  </main>
                </div>
              )}

              {/* 2. CORPORATE PROFESSIONAL */}
              {template === "professional" && (
                <div className="rb-layout-executive">
                  <header className="rb-exec-header">
                    {showPhoto && photo && (
                      <img src={photo} alt="Profile" className="rb-exec-photo" />
                    )}
                    <div className="rb-exec-header-text">
                      <h1>{editableResume.personal_information?.name}</h1>
                      <div className="rb-exec-subtitle">{editableResume.target_role || targetRole}</div>
                      <div className="rb-exec-contacts">
                        <span>{editableResume.personal_information?.email}</span>
                        {editableResume.personal_information?.phone && (
                          <>
                            <span className="bullet">•</span>
                            <span>{editableResume.personal_information?.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </header>

                  <div className="rb-exec-divider" />

                  <div className="rb-exec-body">
                    <div className="rb-exec-section">
                      <h3>PROFESSIONAL PROFILE</h3>
                      <p>{editableResume.professional_summary}</p>
                    </div>

                    <div className="rb-exec-section">
                      <h3>CORE COMPETENCIES & TECHNICAL SKILLS</h3>
                      <div className="rb-exec-skill-chips">
                        {editableResume.technical_skills?.map((skill, i) => (
                          <span key={i} className="rb-exec-chip">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="rb-exec-section">
                      <h3>SIGNIFICANT PROJECTS</h3>
                      {editableResume.projects?.map((proj, i) => (
                        <div key={i} className="rb-exec-project">
                          <div className="rb-exec-proj-head">
                            <strong>{proj.title}</strong>
                          </div>
                          <p>{proj.description}</p>
                          <small>Technologies: {proj.technologies?.join(", ")}</small>
                        </div>
                      ))}
                    </div>

                    {editableResume.education?.length > 0 && (
                      <div className="rb-exec-section">
                        <h3>EDUCATION</h3>
                        {editableResume.education.map((item, i) => (
                          <p key={i}>{item}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. MINIMALIST ATS */}
              {template === "minimal" && (
                <div className="rb-layout-ats">
                  <div className="rb-ats-header">
                    <h1>{editableResume.personal_information?.name}</h1>
                    <div className="rb-ats-contacts">
                      <span>{editableResume.personal_information?.email}</span>
                      {editableResume.personal_information?.phone && (
                        <span> | {editableResume.personal_information?.phone}</span>
                      )}
                    </div>
                    <div className="rb-ats-role">{editableResume.target_role || targetRole}</div>
                  </div>

                  <div className="rb-ats-section">
                    <h2>PROFESSIONAL SUMMARY</h2>
                    <hr />
                    <p>{editableResume.professional_summary}</p>
                  </div>

                  <div className="rb-ats-section">
                    <h2>TECHNICAL SKILLS</h2>
                    <hr />
                    <p>{editableResume.technical_skills?.join(" • ")}</p>
                  </div>

                  <div className="rb-ats-section">
                    <h2>PROJECTS</h2>
                    <hr />
                    {editableResume.projects?.map((proj, i) => (
                      <div key={i} className="rb-ats-project">
                        <strong>{proj.title}</strong>
                        <p>{proj.description}</p>
                        <small>Key Technologies: {proj.technologies?.join(", ")}</small>
                      </div>
                    ))}
                  </div>

                  {editableResume.education?.length > 0 && (
                    <div className="rb-ats-section">
                      <h2>EDUCATION</h2>
                      <hr />
                      {editableResume.education.map((edu, i) => (
                        <p key={i}>{edu}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. CREATIVE TECH GRID */}
              {template === "creative" && (
                <div className="rb-layout-creative">
                  <header className="rb-creative-top">
                    <div className="rb-creative-left">
                      <h1>{editableResume.personal_information?.name}</h1>
                      <div className="rb-creative-role">{editableResume.target_role || targetRole}</div>
                      <div className="rb-creative-meta">
                        <span>{editableResume.personal_information?.email}</span>
                        {editableResume.personal_information?.phone && (
                          <span> | {editableResume.personal_information?.phone}</span>
                        )}
                      </div>
                    </div>
                    {showPhoto && photo && (
                      <img src={photo} alt="Profile" className="rb-creative-photo" />
                    )}
                  </header>

                  <div className="rb-creative-grid">
                    <div className="rb-creative-main">
                      <section className="rb-c-section">
                        <h3>ABOUT ME</h3>
                        <p>{editableResume.professional_summary}</p>
                      </section>

                      <section className="rb-c-section">
                        <h3>FEATURED PROJECTS</h3>
                        <div className="rb-c-projects">
                          {editableResume.projects?.map((proj, i) => (
                            <div key={i} className="rb-c-card">
                              <h4>{proj.title}</h4>
                              <p>{proj.description}</p>
                              <div className="rb-c-tags">
                                {proj.technologies?.map((tech, idx) => (
                                  <span key={idx}>{tech}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="rb-creative-side">
                      <section className="rb-c-section">
                        <h3>TECH STACK</h3>
                        <div className="rb-c-skill-badges">
                          {editableResume.technical_skills?.map((s, i) => (
                            <span key={i} className="rb-c-badge">{s}</span>
                          ))}
                        </div>
                      </section>

                      {editableResume.education?.length > 0 && (
                        <section className="rb-c-section">
                          <h3>EDUCATION</h3>
                          {editableResume.education.map((edu, i) => (
                            <p key={i} className="rb-c-edu">{edu}</p>
                          ))}
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ResumeBuilder;
