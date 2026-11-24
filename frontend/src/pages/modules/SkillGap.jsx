import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  Code2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";
import "./SkillGap.css";

function SkillList({ skills = [], color = "green" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  if (!skills.length) {
    return <p className="text-sm text-slate-400">No skills found.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className={`rounded-full border px-3 py-2 text-sm font-semibold ${styles[color] || styles.green}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function SkillGap() {
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setReport(null);

    if (!resumeId.trim()) {
      setError("Please enter your Resume ID.");
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError("Job Description must contain at least 50 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/skill-gap/", {
        resume_id: resumeId.trim(),
        job_description: jobDescription.trim(),
      });

      if (response.data.success) {
        const data = response.data.result || {};

        setReport({
          ...response.data,
          result: {
            ...data,
            required_skills: [
              ...(data.matched_skills || []),
              ...(data.missing_skills || []),
            ],
          },
        });
      } else {
        setError(response.data.message || "Analysis failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to analyze skill gap. Please check your Resume ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const result = report?.result || {};

  const matchedSkills = result.matched_skills || [];
  const missingSkills = result.missing_skills || [];
  const requiredSkills = result.required_skills || [];

  const roadmap = result.learning_roadmap || result.roadmap || [];

  const totalMatched =
    result.total_matched_skills ?? matchedSkills.length;

  const totalMissing =
    result.total_missing_skills ?? missingSkills.length;

  const gapPercentage =
    result.skill_gap_percentage ??
    result.gap_percentage ??
    (requiredSkills.length
      ? Math.round((totalMissing / requiredSkills.length) * 100)
      : 0);

  const matchPercentage = Math.max(0, 100 - gapPercentage);

  const priorities =
    result.priority_breakdown || result.priority_skills || {};

  const priorityList = (priority) => {
    if (Array.isArray(priorities[priority])) {
      return priorities[priority];
    }

    return roadmap
      .filter(
        (item) => item.priority?.toLowerCase() === priority
      )
      .map((item) => item.skill);
  };

  const priorityConfig = {
    high: {
      title: "High Priority",
      color: "red",
      icon: "🔴",
      description: "Focus on these skills first",
      card: "border-rose-200 bg-rose-50/60",
    },
    medium: {
      title: "Medium Priority",
      color: "orange",
      icon: "🟠",
      description: "Improve these skills next",
      card: "border-orange-200 bg-orange-50/60",
    },
    low: {
      title: "Low Priority",
      color: "blue",
      icon: "🔵",
      description: "Additional skills to develop",
      card: "border-blue-200 bg-blue-50/60",
    },
  };

  return (
    <div className="skill-gap-page min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
  
     <ModuleBackButton />

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-purple-600">
            <Sparkles size={22} />
            <span className="text-sm font-bold tracking-widest">
              RESUMIND AI INTELLIGENCE
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Skill Gap Intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Discover missing skills, evaluate your career readiness
            and build a personalized learning roadmap.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleAnalyze}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <Target size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyze Your Skill Gap
              </h2>
              <p className="text-sm text-slate-500">
                Enter your resume details and target job description.
              </p>
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Resume ID
            </label>

            <input
              type="text"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              placeholder="Enter your Resume ID"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Target Job Description
              </label>

              <span className="text-xs text-slate-400">
                Minimum 50 characters
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
              placeholder="Paste your target job description here..."
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {jobDescription.length} characters
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="shrink-0" />
              <span>{String(error)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-bold text-white shadow-md shadow-purple-200 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Skills...
              </>
            ) : (
              <>
                <Target size={20} />
                Analyze Skill Gap
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Analysis Report */}
        {report && (
          <div className="space-y-6">

            {/* Success Message */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={23} />
              <div>
                <h2 className="font-bold text-emerald-800">
                  Skill Gap Analysis Completed!
                </h2>
                <p className="mt-1 text-sm text-emerald-700">
                  {report.message}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                    <TrendingUp size={25} />
                  </div>
                  <span className="text-xs font-bold text-purple-600">
                    SKILL GAP
                  </span>
                </div>

                <h2 className="text-4xl font-extrabold text-purple-700">
                  {gapPercentage}%
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Skills not detected in your resume
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                    <CheckCircle2 size={25} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    MATCHED
                  </span>
                </div>

                <h2 className="text-4xl font-extrabold text-emerald-600">
                  {totalMatched}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Skills detected in your resume
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                    <AlertCircle size={25} />
                  </div>
                  <span className="text-xs font-bold text-rose-600">
                    MISSING
                  </span>
                </div>

                <h2 className="text-4xl font-extrabold text-rose-500">
                  {totalMissing}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Skills not detected in your resume
                </p>
              </div>
            </div>

            {/* Skill Overview */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Skill Gap Overview
                  </h2>
                  <p className="text-sm text-slate-500">
                    Your current skill match against the job requirements
                  </p>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap justify-between gap-2 text-sm font-semibold">
                <span className="text-emerald-700">
                  Matched: {matchPercentage}%
                </span>
                <span className="text-rose-600">
                  Missing: {gapPercentage}%
                </span>
              </div>

              <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
                <div
                  className="bg-rose-400 transition-all duration-700"
                  style={{ width: `${gapPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Total detected required skills: {requiredSkills.length}
              </p>
            </section>

            {/* Matched and Missing Skills */}
            <div className="grid gap-5 lg:grid-cols-2">

              <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Matched Skills
                    </h2>
                    <p className="text-xs text-slate-500">
                      {matchedSkills.length} skills detected
                    </p>
                  </div>
                </div>

                <SkillList skills={matchedSkills} color="green" />
              </section>

              <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Missing Skills
                    </h2>
                    <p className="text-xs text-slate-500">
                      {missingSkills.length} skills to develop
                    </p>
                  </div>
                </div>

                <SkillList skills={missingSkills} color="red" />
              </section>
            </div>

            {/* Required Skills */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                  <Code2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Required Skills
                  </h2>
                  <p className="text-sm text-slate-500">
                    Skills identified from the job description and resume
                  </p>
                </div>
              </div>

              <SkillList skills={requiredSkills} color="purple" />
            </section>

            {/* Priority Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                  <Award size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Skill Priority
                  </h2>
                  <p className="text-sm text-slate-500">
                    Recommended order for improving your skills
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {["high", "medium", "low"].map((priority) => {
                  const config = priorityConfig[priority];

                  return (
                    <div
                      key={priority}
                      className={`rounded-2xl border p-5 ${config.card}`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span>{config.icon}</span>
                        <h3 className="font-bold text-slate-900">
                          {config.title}
                        </h3>
                      </div>

                      <p className="mb-4 text-xs text-slate-500">
                        {config.description}
                      </p>

                      <SkillList
                        skills={priorityList(priority)}
                        color={config.color}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Learning Roadmap */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Personalized Learning Roadmap
                  </h2>
                  <p className="text-sm text-slate-500">
                    A learning path based on your identified skill gaps
                  </p>
                </div>
              </div>

              {roadmap.length > 0 ? (
                <div className="space-y-5">
                  {roadmap.map((item, index) => {
                    const priority = item.priority?.toLowerCase();

                    const badgeStyle =
                      priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700";

                    return (
                      <div
                        key={`${item.skill || "skill"}-${index}`}
                        className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-purple-200 hover:bg-white hover:shadow-md md:p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div>
                              <h3 className="text-lg font-bold capitalize text-slate-900">
                                {item.skill || "Recommended Skill"}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.category || "General Development"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${badgeStyle}`}
                          >
                            {item.priority || "Recommended"} Priority
                          </span>
                        </div>

                        {item.level && (
                          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                            <GraduationCap size={16} />
                            Level: {item.level}
                          </div>
                        )}

                        {item.learning_topics?.length > 0 && (
                          <div className="mt-5">
                            <h4 className="mb-3 text-sm font-bold text-slate-700">
                              Topics to Learn
                            </h4>

                            <div className="grid gap-2 sm:grid-cols-2">
                              {item.learning_topics.map((topic, i) => (
                                <div
                                  key={`${topic}-${i}`}
                                  className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-700"
                                >
                                  <CheckCircle2
                                    size={17}
                                    className="mt-0.5 shrink-0 text-purple-600"
                                  />
                                  {topic}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No learning roadmap was returned by the API.
                </p>
              )}
            </section>

            {/* Note */}
            {result.note && (
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-sm leading-6 text-purple-800">
                <strong>Important Note:</strong> {result.note}
              </div>
            )}

            <p className="pb-5 text-center text-xs leading-5 text-slate-400">
              Skill gap analysis is based on skills detected in your resume
              and the selected job description. Missing skills indicate
              that they were not detected, not necessarily that you lack them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillGap;
