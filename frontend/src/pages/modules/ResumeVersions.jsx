import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  History,
  Search,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
} from "lucide-react";

import api from "../../services/api";
import "./ResumeVersions.css";

function ResumeVersions() {
  const [resumeId, setResumeId] = useState("");
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVersions = async (e) => {
    e.preventDefault();

    if (!resumeId.trim()) {
      setError("Please enter your Resume ID.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setVersions([]);

    try {
      const response = await api.get(
        `/resume-versions/${encodeURIComponent(resumeId.trim())}`
      );

      const data = response.data;
      const versionList = Array.isArray(data.versions)
        ? data.versions
        : [];

      setVersions(versionList);
      setSuccess(
        `${versionList.length} resume version(s) found successfully!`
      );
    } catch (err) {
      console.error("Resume Versions Error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load resume versions. Please check your Resume ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadVersion = async (builderId) => {
    if (!builderId) {
      setError("Builder ID not found for this version.");
      return;
    }

    setDownloadingId(builderId);
    setError("");

    try {
      const response = await api.get(
        `/resume-export/${builderId}/pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Resume_Version_${builderId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Version Download Error:", err);
      setError("PDF download failed. Please try again.");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <div className="resume-versions-page min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <ModuleBackButton/>
        

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-indigo-400">
            <History size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Resume Intelligence
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Resume Version Management
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your saved resume versions and download previous versions
            whenever you need them.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400">
              <Search size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Find Resume Versions
              </h2>
              <p className="text-sm text-slate-400">
                Enter the Resume ID to view its version history.
              </p>
            </div>
          </div>

          <form onSubmit={loadVersions}>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Resume ID
            </label>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                placeholder="Enter your Resume ID"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : (
                  <Search size={19} />
                )}
                {loading ? "Loading..." : "View Versions"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && !error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            <CheckCircle2 size={20} />
            <p>{success}</p>
          </div>
        )}

        {versions.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Version History
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your saved resume versions, newest first.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-indigo-300">
                <Layers size={19} />
                <span className="font-semibold">
                  {versions.length} Versions
                </span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {versions.map((version) => (
                <div
                  key={version.builder_id}
                  className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 transition hover:border-indigo-500/50"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400">
                        <FileText size={23} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          Resume Version {version.version}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Saved version
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Saved
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-slate-700 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Target Role</p>
                      <p className="mt-1 font-medium text-slate-200">
                        {version.target_role || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Template</p>
                      <p className="mt-1 font-medium capitalize text-slate-200">
                        {version.template || "Default"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Created At</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {version.created_at
                          ? new Date(version.created_at).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadVersion(version.builder_id)}
                    disabled={downloadingId === version.builder_id}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 font-semibold text-indigo-300 transition hover:bg-indigo-500/20 disabled:opacity-60"
                  >
                    {downloadingId === version.builder_id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && success && versions.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-center">
            <History size={36} className="mx-auto mb-3 text-slate-500" />
            <h3 className="font-semibold text-white">
              No Versions Found
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Generate a resume using Resume Builder to create saved versions.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Resume version history is retrieved from your saved account data.
        </p>
      </div>
    </div>
  );
}

export default ResumeVersions;
