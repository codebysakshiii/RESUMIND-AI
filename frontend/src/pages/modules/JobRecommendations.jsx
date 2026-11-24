
import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";

import {
  BriefcaseBusiness,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Bookmark,
  ExternalLink,
  Target,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import "./JobRecommendations.css";

function JobRecommendations() {
  const [form, setForm] = useState({
    resume_id: "",
    target_role: "Python Developer",
    job_type: "both",
    location: "Remote",
    work_mode: "any",
  });

  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  // Safely format API errors
  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item.msg || "Invalid input")
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof err.response?.data?.message === "string") {
      return err.response.data.message;
    }

    return fallback;
  };

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Load user's applications
  const loadApplications = async () => {
    setApplicationsLoading(true);

    try {
      const response = await api.get(
        "/job-recommendations/applications"
      );

      const applicationList = Array.isArray(
        response.data?.applications
      )
        ? response.data.applications
        : [];

      setApplications(applicationList);
    } catch (err) {
      console.error("Applications Error:", err);
      setError(
        getErrorMessage(err, "Unable to load applications.")
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Find job recommendations
    // Find job recommendations
  const findRecommendations = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setRecommendations([]);

    if (!form.resume_id.trim() || !form.target_role.trim()) {
      setError("Please enter Resume ID and Target Role.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        resume_id: form.resume_id.trim(),
        target_role: form.target_role.trim(),
        job_type: form.job_type,
        location: form.location.trim() || null,
        work_mode: form.work_mode,
      };

      console.log("JOB REQUEST:", payload);

      const response = await api.post(
        "/job-recommendations/",
        payload
      );

      console.log("JOB API RESPONSE:", response.data);

      const jobs = Array.isArray(response.data?.recommendations)
        ? response.data.recommendations
        : [];

      setRecommendations(jobs);
      setSuccess(`${jobs.length} job recommendations found!`);

      await loadApplications();

    } catch (err) {
      console.error("Recommendation Error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to find recommendations. Please check your Resume ID."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplication = async (jobId, status) => {
    if (!status) return;

    setUpdatingId(jobId);
    setError("");
    setSuccess("");

    try {
      await api.post(
        `/job-recommendations/${jobId}/apply`,
        { status }
      );

      setSuccess(
        `Application status updated to ${status}!`
      );

      await loadApplications();
    } catch (err) {
      console.error("Application Update Error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to update application status."
        )
      );
    } finally {
      setUpdatingId("");
    }
  };

  // Get current application status
  const getStatus = (jobId) => {
    const application = applications.find(
      (item) => item.job_id === jobId
    );

    return application?.status || "";
  };

  return (
    <div className="job-recommendations-page min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <ModuleBackButton />

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-indigo-400">
            <Sparkles size={20} />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Career Opportunities
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            AI Job & Internship Recommendations
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Discover job and internship opportunities based on
            your resume skills and track your applications.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-3 text-indigo-400">
              <Search size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Find Opportunities
              </h2>

              <p className="text-sm text-gray-400">
                Enter your resume details to get matching listings.
              </p>
            </div>
          </div>

          <form
            onSubmit={findRecommendations}
            className="space-y-5"
          >
            {/* Resume ID */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Resume ID
              </label>

              <input
                type="text"
                name="resume_id"
                value={form.resume_id}
                onChange={handleChange}
                placeholder="Enter your uploaded resume ID"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Target Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Target Role
                </label>

                <input
                  type="text"
                  name="target_role"
                  value={form.target_role}
                  onChange={handleChange}
                  required
                  placeholder="Python Developer"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Opportunity Type
                </label>

                <select
                  name="job_type"
                  value={form.job_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="both">Jobs & Internships</option>
                  <option value="job">Jobs Only</option>
                  <option value="internship">Internships Only</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Remote, Pune, Indore"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Work Mode */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Work Mode
                </label>

                <select
                  name="work_mode"
                  value={form.work_mode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="any">Any Work Mode</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={19} />
                  Finding Opportunities...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Find Matching Opportunities
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300">
            <CheckCircle2 size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <BriefcaseBusiness
              className="text-indigo-400"
              size={23}
            />

            <h2 className="text-2xl font-bold text-white">
              Recommended Opportunities
            </h2>

            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300">
              {recommendations.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center">
              <Loader2
                className="mx-auto mb-3 animate-spin text-indigo-400"
                size={35}
              />
              <p className="text-gray-400">
                Finding matching opportunities...
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center">
              <Target
                className="mx-auto mb-3 text-gray-500"
                size={40}
              />

              <h3 className="text-lg font-semibold text-white">
                No Recommendations Yet
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Submit your resume details to discover matching opportunities.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {recommendations.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 transition hover:border-indigo-500/40"
                >
                  {/* Job Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-indigo-300">
                        {job.company}
                      </p>
                    </div>

                    <div className="rounded-xl bg-indigo-500/15 px-3 py-2 text-center">
                      <div className="text-xl font-bold text-indigo-300">
                        {job.match_score ?? job.match_percentage ?? 0}%
                      </div>

                      <div className="text-xs text-gray-400">
                        Skill Match
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-300">
                      {job.job_type}
                    </span>

                    <span className="rounded-full bg-purple-500/15 px-3 py-1 text-purple-300">
                      {job.experience_level}
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-gray-300">
                      <MapPin size={12} />
                      {job.location}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-gray-300">
                      {job.work_mode}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-5 text-sm leading-6 text-gray-400">
                    {job.description}
                  </p>

                  {/* Matched Skills */}
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-green-300">
                      Matched Skills
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(job.matched_skills) &&
                      job.matched_skills.length > 0 ? (
                        job.matched_skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-green-500/10 px-2.5 py-1 text-xs text-green-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No matched skills
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="mb-5">
                    <h4 className="mb-2 text-sm font-semibold text-red-300">
                      Skills to Improve
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(job.missing_skills) &&
                      job.missing_skills.length > 0 ? (
                        job.missing_skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No missing skills
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Application Actions */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                    <select
                      value={getStatus(job.job_id)}
                      onChange={(e) =>
                        updateApplication(job.job_id, e.target.value)
                      }
                      disabled={updatingId === job.job_id}
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                    >
                      <option value="" disabled>
                        Track Application
                      </option>

                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="offered">Offered</option>
                    </select>

                    {updatingId === job.job_id && (
                      <Loader2
                        className="animate-spin text-indigo-400"
                        size={18}
                      />
                    )}

                    {job.apply_url && (
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        Apply
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bookmark
                className="text-indigo-400"
                size={22}
              />

              <h2 className="text-xl font-bold text-white">
                My Applications
              </h2>
            </div>

            <button
              type="button"
              onClick={loadApplications}
              disabled={applicationsLoading}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={applicationsLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {applicationsLoading && applications.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              <Loader2
                className="mx-auto mb-2 animate-spin"
                size={22}
              />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No tracked applications yet.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((application, index) => (
                <div
                  key={`${application.job_id}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/70 p-4"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {application.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {application.company} · {application.location}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold capitalize text-indigo-300">
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-center text-xs text-gray-500">
          Match scores are estimates based on resume and job-description
          skill overlap. Verify each vacancy and application link before applying.
        </p>
      </div>
    </div>
  );
}

export default JobRecommendations;
