
import { Link, useNavigate } from "react-router-dom";

import {
  FileText,
  BriefcaseBusiness,
  Brain,
  WandSparkles,
  MessageSquare,
  History,
  GitCompareArrows,
  ChartNoAxesCombined,
  LogOut,
  ArrowUpRight,
  Sparkles,
  Target,
  Route,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import "../Auth.css";
import "./Dashboard.css";


const modules = [
  {
    title: "AI Resume Analyzer",
    description: "Analyze your resume, ATS score and get actionable feedback.",
    icon: FileText,
    path: "/dashboard/resume-analyzer",
    tag: "Resume Intelligence",
  },
  {
    title: "AI Job Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: BriefcaseBusiness,
   path: "/dashboard/job-matching",
    tag: "Job Intelligence",
  },
  {
    title: "Skill Gap Intelligence",
    description: "Identify missing skills and build your learning roadmap.",
    icon: Brain,
   path: "/dashboard/skill-gap",
    tag: "Skill Development",
  },
  {
    title: "AI Resume Builder",
    description: "Create professional resumes with AI-powered suggestions.",
    icon: WandSparkles,
  
  path: "/dashboard/resume-builder",

    tag: "Resume Creation",
  },
  {
    title: "AI Mock Interview",
    description: "Practice interviews and improve your performance.",
    icon: MessageSquare,
    path: "/dashboard/mock-interview",
    tag: "Interview Practice",
  },
  
  {
  title: "Personal AI Career Agent",
  description: "Generate a personalized career roadmap based on your resume and target role.",
  icon: Target,
  path: "/dashboard/career-agent",
  tag: "Career Planning",
},

{
  title: "AI Job & Internship Recommendations",
  description:
    "Discover matching job and internship opportunities and track your applications.",
  icon: BriefcaseBusiness,
  path: "/dashboard/job-recommendations",
  tag: "Career Opportunities",
},

{
  title: "Resume Version Management",
  description:
    "Manage your resume history, view saved versions and download previous resumes.",
  icon: History,
  path: "/dashboard/resume-versions",
  tag: "Resume History",
},


{
  title: "AI Resume Version Comparison",
  description:
    "Compare different resume versions, track changes and review added or removed skills and projects.",
  icon: GitCompareArrows,
  path: "/dashboard/resume-comparison",
  tag: "Version Insights",
},

{
  title: "ATS Score Improvement Tracker",
  description:
    "Track your resume ATS score improvements and compare previous and updated resume performance.",
  icon: Target,
  path: "/dashboard/ats-tracker",
  tag: "Score Tracking",
},

{
  title: "Resume Analytics Dashboard",
  description:
    "Track your resume performance, ATS scores, resume versions and career progress with detailed analytics.",
  icon: ChartNoAxesCombined,
  path: "/dashboard/resume-analytics",
  tag: "Performance Insights",
},

{
  title: "AI Career Roadmap & Learning Tracker",
  description:
    "Build your personalized career roadmap, track learning goals and monitor your skill development progress.",
  icon: Route,
  path: "/dashboard/learning-roadmap",
  tag: "Career Development",
},

];

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <Link to="/" className="auth-brand dashboard-brand">
          RESUMIND<span>AI.</span>
        </Link>

        <div className="dashboard-user">
          <div className="dashboard-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-user-info">
            <strong>{user?.full_name || "User"}</strong>
            <span>{user?.email}</span>
          </div>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              <Sparkles size={15} /> YOUR AI CAREER WORKSPACE
            </span>

            <h1>
              Welcome back, {firstName}!
            </h1>

            <p>
              Your career journey starts here. Choose an AI tool
              and take your next step towards success.
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Your AI workspace</h2>
              <p>Everything you need to accelerate your career.</p>
            </div>

            <span className="dashboard-module-count">
              11 MODULES
            </span>
          </div>

          <div className="dashboard-grid">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <article className="dashboard-module" key={module.title}>
                  <div className="dashboard-module-top">
                    <div className="dashboard-module-icon">
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight size={19} className="module-arrow" />
                  </div>

                  <span className="dashboard-module-tag">
                    {module.tag}
                  </span>

                  <h3>{module.title}</h3>

                  <p>{module.description}</p>

                  <Link to={module.path} className="module-open">
                    Explore module <ArrowUpRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>RESUMIND AI</span>
          <span>Build your career. Intelligently.</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
