import ModuleBackButton from "../../components/ModuleBackButton";
import { useState } from "react";
import {
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Clock,
  BriefcaseBusiness,
  FolderKanban,
  TrendingUp,
  Bot,
  Send,
  MessageSquare,
  Award,
  Calendar,
  ChevronRight,
  Flame,
  UserCheck
} from "lucide-react";

import api from "../../services/api";
import "./CareerAgent.css";

const PRESET_ROLES = [
  "Python Backend Developer",
  "Full Stack Web Engineer",
  "Frontend React Developer",
  "AI & Data Scientist",
  "DevOps & Cloud Engineer",
];

const PREPARED_QUESTIONS = [
  "What are the top 3 interview questions for this role?",
  "How should I describe my projects on my resume?",
  "What is the average fresher salary for this role in India?",
  "Which certifications will add the most value to my profile?",
];

function CareerAgent() {
  const [resumeId, setResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("Python Developer");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [careerGoal, setCareerGoal] = useState("get_first_job"); // get_first_job, switch_role, higher_salary

  const [activeTab, setActiveTab] = useState("roadmap"); // roadmap, mentor_chat, interview_prep, projects
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Mentor Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "agent",
      text: "👋 Hi! I am your Autonomous AI Career Agent. I analyze your resume, build week-by-week skill roadmaps, and help you crack tech interviews. How can I assist your career today?",
      time: "Just now",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);

  const generatePlan = async (e) => {
    e.preventDefault();

    if (!resumeId.trim() || !targetRole.trim()) {
      setError("Please enter Resume ID and target role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPlan(null);

      const response = await api.post("/career-agent/", {
        resume_id: resumeId.trim(),
        target_role: targetRole.trim(),
        weekly_hours: Number(weeklyHours),
        experience_level: experienceLevel,
      });

      setPlan(response.data.plan);

      // Add a dynamic message from the mentor
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `🎯 I've calibrated your career plan for **${targetRole}**! You have **${response.data.plan.current_skills?.length || 0} existing skills** and **${response.data.plan.total_missing_skills || 0} skills to acquire**. Let's start with Week 1!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Career Agent Error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to generate career plan. Please check your Resume ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = {
      sender: "user",
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setAgentTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("interview") || lower.includes("question")) {
        reply = `💡 For a **${targetRole}**, focus heavily on:\n1. Core concepts (OOP, Data Structures, Memory management)\n2. RESTful APIs & database query optimization\n3. Walkthrough of your best project and how you solved challenging bugs.\n\nPractice explaining your code out loud!`;
      } else if (lower.includes("salary") || lower.includes("package")) {
        reply = `💰 For **${targetRole}** (${experienceLevel}):\n• Fresher entry-level in India: ₹4.5 LPA - ₹8.5 LPA (Product companies reach ₹12-18 LPA)\n• 2-4 years experience: ₹10 LPA - ₹22 LPA.\nBuilding strong GitHub projects significantly boosts offer value.`;
      } else if (lower.includes("project") || lower.includes("describe")) {
        reply = `🛠 When explaining projects on your resume, use the **STAR method** (Situation, Task, Action, Result):\n- What problem does it solve?\n- Exactly what tech stack did you use?\n- Add measurable outcomes (e.g. "Processed 100+ requests with 200ms latency").`;
      } else if (lower.includes("certif")) {
        reply = `🏆 High-impact certifications for **${targetRole}**:\n1. AWS Certified Cloud Practitioner / Solutions Architect\n2. Python Institute PCAP / PCPP\n3. MongoDB Certified Developer\n*Note: Hands-on GitHub projects usually carry more weight than certificates!*`;
      } else {
        reply = `🤖 Excellent question! For your roadmap in **${targetRole}**, the fastest milestone is mastering ${plan?.missing_skills?.[0] || "core development concepts"} and deploying a live project. Keep your weekly study target of ${weeklyHours} hours consistent!`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setAgentTyping(false);
    }, 700);
  };

  // Readiness Score
  const currentSkillsCount = plan?.current_skills?.length || 0;
  const missingSkillsCount = plan?.total_missing_skills || 0;
  const totalSkills = currentSkillsCount + missingSkillsCount;
  const readinessPercent = totalSkills > 0 ? Math.round((currentSkillsCount / totalSkills) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <ModuleBackButton />

        {/* Top Hero Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-violet-400">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                AI CAREER INTELLIGENCE PLATFORM
              </span>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Autonomous AI Career Agent
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Your 24/7 personal career mentor: automated skill gap roadmaps, live AI strategy chat, 
              project recommendations, and real-time interview advice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              AI Agent Active
            </span>
          </div>
        </div>

        {/* Main Grid: Left Setup + Right AI Control Center */}
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          {/* LEFT: Setup Card */}
          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
                <Target size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Career Calibration</h2>
                <p className="text-xs text-slate-400">Configure your target trajectory</p>
              </div>
            </div>

            <form onSubmit={generatePlan} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resume ID *
                </label>
                <input
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  placeholder="e.g. 6b0559292d66e46d52e65117"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Tip: Get your ID from Resume Analyzer report.
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Career Role *
                </label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Python Developer"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                {/* Preset Role Tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 transition hover:border-violet-400 hover:text-white"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs outline-none focus:border-violet-500"
                  >
                    <option value="fresher">Fresher (0-1 yr)</option>
                    <option value="beginner">Junior (1-2 yrs)</option>
                    <option value="intermediate">Mid-Level (2-4 yrs)</option>
                    <option value="experienced">Senior (4+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Career Goal
                  </label>
                  <select
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs outline-none focus:border-violet-500"
                  >
                    <option value="get_first_job">Land 1st Tech Job</option>
                    <option value="switch_role">Domain / Role Switch</option>
                    <option value="higher_salary">Salary Hike & Promotion</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Weekly Commitment
                  </span>
                  <span className="font-bold text-violet-400">{weeklyHours} hrs / week</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  className="w-full accent-violet-500"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>5 hrs (Part-time)</span>
                  <span>25 hrs</span>
                  <span>45 hrs (Intense)</span>
                </div>
              </div>

              {error && (
                <div className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Agent Analyzing Career Paths...
                  </>
                ) : (
                  <>
                    <Bot size={18} />
                    Run AI Career Agent
                  </>
                )}
              </button>
            </form>

            {/* Quick Helper Tips */}
            <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Flame size={14} className="text-orange-400" /> Agent Capabilities:
              </span>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
                <li>• Real-time skill extraction from your resume</li>
                <li>• Step-by-step roadmap divided into practical weeks</li>
                <li>• Interactive AI mentor Q&A chat for instant career answers</li>
              </ul>
            </div>
          </section>

          {/* RIGHT: Agent Output & Interactive Hub */}
          <section className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2">
              <button
                type="button"
                onClick={() => setActiveTab("roadmap")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "roadmap"
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen size={15} />
                Skill Roadmap
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mentor_chat")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "mentor_chat"
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare size={15} />
                AI Mentor Chat
                <span className="rounded-full bg-violet-400/20 px-1.5 py-0.5 text-[10px] text-violet-300">
                  Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "projects"
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FolderKanban size={15} />
                Portfolio Projects
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("interview_prep")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === "interview_prep"
                    ? "bg-violet-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Award size={15} />
                Interview Tips
              </button>
            </div>

            {/* TAB 1: ROADMAP */}
            {activeTab === "roadmap" && (
              <div className="space-y-6">
                {!plan ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
                    <div className="mb-4 rounded-2xl bg-violet-500/10 p-5 text-violet-400">
                      <BriefcaseBusiness size={40} />
                    </div>
                    <h3 className="text-lg font-bold">Your Career Blueprint Will Appear Here</h3>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
                      Enter your Resume ID and hit <strong>Run AI Career Agent</strong> to generate 
                      a custom learning path.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <UserCheck className="mb-2 text-emerald-400" size={20} />
                        <p className="text-2xl font-black">{plan.current_skills?.length || 0}</p>
                        <p className="text-[11px] font-medium text-slate-400">Current Skills</p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <Target className="mb-2 text-orange-400" size={20} />
                        <p className="text-2xl font-black">{plan.total_missing_skills || 0}</p>
                        <p className="text-[11px] font-medium text-slate-400">Missing Skills</p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <Clock className="mb-2 text-cyan-400" size={20} />
                        <p className="text-2xl font-black">{plan.estimated_duration_weeks}</p>
                        <p className="text-[11px] font-medium text-slate-400">Target Weeks</p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <Flame className="mb-2 text-violet-400" size={20} />
                        <p className="text-2xl font-black">{readinessPercent}%</p>
                        <p className="text-[11px] font-medium text-slate-400">Role Readiness</p>
                      </div>
                    </div>

                    {/* Readiness Progress Bar */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                      <div className="mb-2 flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Target Role Match: {plan.target_role}</span>
                        <span className="text-violet-400">{readinessPercent}% Match</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
                          style={{ width: `${readinessPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
                          <CheckCircle2 size={16} /> Verified Skills (In Resume)
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.current_skills?.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-400">
                          <TrendingUp size={16} /> High-Priority Skills To Learn
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.missing_skills?.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Week-by-Week Detailed Timeline */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
                        <Calendar size={18} className="text-violet-400" />
                        Weekly Execution Plan
                      </h3>

                      <div className="space-y-4">
                        {plan.weekly_plan?.map((week) => (
                          <div
                            key={week.week}
                            className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-violet-500/50"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="rounded-md bg-violet-600/20 px-2.5 py-0.5 text-xs font-bold text-violet-300">
                                WEEK {week.week}
                              </span>
                              <span className="text-xs text-slate-500">
                                {plan.weekly_hours} hrs dedicated
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white">{week.focus_skill}</h4>

                            <ul className="mt-2 space-y-1.5">
                              {week.activities?.map((act, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                  <ChevronRight size={13} className="mt-0.5 shrink-0 text-violet-400" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: AI MENTOR CHAT */}
            {activeTab === "mentor_chat" && (
              <div className="flex h-[580px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">ResuMind AI Career Advisor</h3>
                      <p className="text-[11px] text-emerald-400">Always online & tuned to your resume</p>
                    </div>
                  </div>
                </div>

                {/* Pre-made Quick Prompts */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {PREPARED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="rounded-lg border border-slate-700/60 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-violet-500 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat Stream */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-violet-600 text-white"
                            : "border border-slate-800 bg-slate-950 text-slate-200"
                        }`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                  ))}
                  {agentTyping && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 size={13} className="animate-spin text-violet-400" />
                      <span>AI Agent is drafting strategic advice...</span>
                    </div>
                  )}
                </div>

                {/* Input Field */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="mt-3 flex gap-2 border-t border-slate-800 pt-3"
                >
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask about salary, skills, resume polishing or interviews..."
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-white transition hover:bg-violet-500"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-white">
                    High-Impact Portfolio Projects for {targetRole}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recruiters test candidates on practical GitHub repositories. Build these to stand out.
                  </p>
                </div>

                <div className="space-y-3">
                  {(plan?.recommended_projects || [
                    `Build an end-to-end ${targetRole} API with token authentication and database integration.`,
                    `Develop a live responsive dashboard connecting with third-party web services.`,
                    `Create an automated portfolio project with CI/CD deployment on Render / AWS.`
                  ]).map((proj, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-cyan-500/40"
                    >
                      <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
                        <FolderKanban size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">Project #{idx + 1}</h4>
                        <p className="mt-1 text-xs text-slate-300">{proj}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Difficulty: {idx === 0 ? "Beginner" : idx === 1 ? "Intermediate" : "Advanced"}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">High Recruiter Weight</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: INTERVIEW TIPS */}
            {activeTab === "interview_prep" && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-white">
                    Technical & HR Interview Strategy
                  </h3>
                  <p className="text-xs text-slate-400">
                    Key guidelines curated by senior hiring managers to ace candidate screenings.
                  </p>
                </div>

                <div className="space-y-3">
                  {(plan?.career_advice || [
                    "Practice Data Structures and Algorithms regularly.",
                    "Build practical projects for your portfolio.",
                    "Maintain your GitHub profile.",
                    "Prepare for technical and HR interviews.",
                    "Improve communication skills."
                  ]).map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-violet-400" />
                      <p className="text-xs text-slate-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CareerAgent;
