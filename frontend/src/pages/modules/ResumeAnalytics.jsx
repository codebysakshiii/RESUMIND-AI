
import { useEffect, useState } from "react";
import ModuleBackButton from "../../components/ModuleBackButton";
import {
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  Layers,
  Brain,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../../services/api";
import "./ResumeAnalytics.css";

function ResumeAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resume-analytics/");
      setAnalytics(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load resume analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const response = await api.get("/resume-analytics/");

        if (active) {
          setAnalytics(response.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.detail ||
              "Unable to load resume analytics. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const stats = analytics
    ? [
        {
          title: "Total Resumes",
          value: analytics.total_resumes,
          icon: FileText,
          color: "blue",
        },
        {
          title: "Total Analyses",
          value: analytics.total_analyses,
          icon: BarChart3,
          color: "purple",
        },
        {
          title: "Average ATS Score",
          value: `${analytics.average_ats_score}%`,
          icon: Target,
          color: "green",
        },
        {
          title: "Highest ATS Score",
          value: `${analytics.highest_ats_score}%`,
          icon: TrendingUp,
          color: "orange",
        },
        {
          title: "Resume Versions",
          value: analytics.total_resume_versions,
          icon: Layers,
          color: "pink",
        },
        {
          title: "Job Matches",
          value: analytics.total_job_matches,
          icon: BriefcaseBusiness,
          color: "cyan",
        },
        {
          title: "Skill Gap Analyses",
          value: analytics.total_skill_gap_analyses,
          icon: Brain,
          color: "red",
        },
        {
          title: "Lowest ATS Score",
          value: `${analytics.lowest_ats_score}%`,
          icon: Target,
          color: "yellow",
        },
      ]
    : [];

  const chartData = (analytics?.score_history || []).map(
    (item, index) => ({
      name: `#${index + 1}`,
      score: item.ats_score,
      date: new Date(item.created_at).toLocaleDateString(),
    })
  );

  if (loading) {
    return (
      <div className="analytics-state">
        <LoaderCircle className="analytics-spinner" size={38} />
        <p>Loading your resume analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-state analytics-error">
        <AlertCircle size={38} />
        <h2>Unable to Load Analytics</h2>
        <p>{error}</p>
        <button onClick={fetchAnalytics}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="resume-analytics-page">

    <ModuleBackButton />
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            RESUMIND AI / INTELLIGENCE
          </span>
          <h1>Resume Analytics</h1>
          <p>
            Track your resume performance, ATS scores and career progress.
          </p>
        </div>

        <button
          className="analytics-refresh-btn"
          onClick={fetchAnalytics}
        >
          <RefreshCw size={17} />
          Refresh Data
        </button>
      </div>

      <div className="analytics-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="analytics-stat-card" key={stat.title}>
              <div className={`analytics-stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>

              <div className="analytics-stat-info">
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-chart-card">
        <div className="analytics-chart-header">
          <div>
            <h2>ATS Score History</h2>
            <p>Your resume score performance over time</p>
          </div>

          <span className="analytics-chart-badge">
            {chartData.length} Records
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#29334b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#929bb3"
                  tick={{ fill: "#929bb3", fontSize: 12 }}
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#929bb3"
                  tick={{ fill: "#929bb3", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#151d31",
                    border: "1px solid #38425d",
                    borderRadius: "10px",
                    color: "#ffffff",
                  }}
                  formatter={(value) => [`${value}%`, "ATS Score"]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.date
                      ? `${label} · ${payload[0].payload.date}`
                      : label
                  }
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#9b8cff"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#9b8cff",
                    stroke: "#151d31",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="analytics-empty">
            No ATS score history available yet.
          </p>
        )}
      </div>

      <div className="analytics-insight-card">
        <div className="analytics-insight-icon">
          <TrendingUp size={23} />
        </div>

        <div>
          <h3>Your Resume Performance</h3>
          <p>
            Your average ATS score is{" "}
            <strong>{analytics.average_ats_score}%</strong>.
            Your highest recorded score is{" "}
            <strong>{analytics.highest_ats_score}%</strong>.
            Keep improving your resume and tracking your progress.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalytics;
