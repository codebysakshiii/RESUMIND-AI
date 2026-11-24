import ModuleBackButton from "../../components/ModuleBackButton";
import { useEffect, useState } from "react";
import {
  Map,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Code2,
  Award,
  ArrowRight,
  X,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";
import "./LearningRoadmap.css";

function LearningRoadmap() {
  const [activeTab, setActiveTab] = useState("overview");

  // Learning Goals
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Notifications
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Learning Goal Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skill: "",
    due_date: "",
  });

  // Career Roadmap
  const [roadmapData, setRoadmapData] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [updatingWeek, setUpdatingWeek] = useState(null);

  // Skill Progress Tracking
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [updatingSkillId, setUpdatingSkillId] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);

  // Roadmap Generator Form
  const [roadmapForm, setRoadmapForm] = useState({
    target_role: "Python Full Stack Developer",
    current_skills: "C, Python, HTML, CSS",
    target_skills:
      "Core Python, OOP, SQL, FastAPI, MongoDB, React, Git and GitHub",
    daily_study_hours: 2,
    duration_weeks: 8,
  });

  // Default Roadmap
  const defaultRoadmap = [
    {
      week: "Week 1",
      title: "Core Python",
      skills: "Variables, Loops, Functions",
      status: "completed",
    },
    {
      week: "Week 2",
      title: "Object Oriented Programming",
      skills: "Classes, Objects, Inheritance",
      status: "current",
    },
    {
      week: "Week 3",
      title: "SQL & Databases",
      skills: "Queries, Joins, Database Design",
      status: "upcoming",
    },
    {
      week: "Week 4",
      title: "FastAPI Development",
      skills: "REST APIs, Authentication",
      status: "upcoming",
    },
    {
      week: "Week 5",
      title: "MongoDB",
      skills: "CRUD, Collections, Aggregation",
      status: "upcoming",
    },
    {
      week: "Week 6",
      title: "React Development",
      skills: "Components, Hooks, Routing",
      status: "upcoming",
    },
    {
      week: "Week 7",
      title: "Full Stack Integration",
      skills: "Frontend + Backend",
      status: "upcoming",
    },
    {
      week: "Week 8",
      title: "Projects & Interview Prep",
      skills: "GitHub, Projects, Practice",
      status: "upcoming",
    },
  ];

  // Dynamic Roadmap
  const roadmap = roadmapData?.weekly_plan?.length
    ? roadmapData.weekly_plan.map((item, index) => ({
        week: `Week ${item.week}`,
        title: item.title,
        skills: item.skills?.join(", ") || "Revision and practice",
        status: item.completed
          ? "completed"
          : index === 0
            ? "current"
            : "upcoming",
      }))
    : defaultRoadmap;

  // Weekly Progress
  const completedWeeks = roadmap.filter(
    (item) => item.status === "completed"
  ).length;

  const totalWeeks = roadmap.length;

  const weeklyProgress = totalWeeks
    ? Math.round((completedWeeks / totalWeeks) * 100)
    : 0;

  // Goal Statistics
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const pendingGoals = goals.length - completedGoals;

  const progress =
    goals.length > 0
      ? Math.round((completedGoals / goals.length) * 100)
      : 0;

  // Skill Statistics
  const completedSkills = skills.filter(
    (skill) => skill.completed
  ).length;

  const averageSkillProgress = skills.length
    ? Math.round(
        skills.reduce(
          (total, skill) => total + (skill.progress || 0),
          0
        ) / skills.length
      )
    : 0;

  // Load Learning Goals
  const loadGoals = async () => {
    try {
      setError("");

      const response = await api.get("/learning-goals/");

      setGoals(response.data.goals || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load learning goals. Please check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load Goals, Roadmap and Skills

// Load Goals, Roadmap and Skills
useEffect(() => {
  let isMounted = true;

  Promise.all([
    api.get("/learning-goals/"),
    api.get("/learning-roadmap/"),
    api.get("/skill-progress/"),
  ])
    .then(([goalsResponse, roadmapResponse, skillsResponse]) => {
      if (isMounted) {
        setGoals(goalsResponse.data.goals || []);
        setRoadmapData(roadmapResponse.data.roadmap || null);
        setSkills(skillsResponse.data.skills || []);
      }
    })
    .catch((err) => {
      if (isMounted) {
        setError(
          err.response?.data?.detail ||
            "Unable to load learning data."
        );
      }
    })
    .finally(() => {
      if (isMounted) {
        setLoadingSkills(false);
      }
    });

  return () => {
    isMounted = false;
  };
}, []);

  // Generate Personalized Career Roadmap
  const handleGenerateRoadmap = async (event) => {
    event.preventDefault();

    try {
      setGeneratingRoadmap(true);
      setError("");
      setSuccess("");

      const payload = {
        target_role: roadmapForm.target_role.trim(),
        current_skills: roadmapForm.current_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        target_skills: roadmapForm.target_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        daily_study_hours: Number(roadmapForm.daily_study_hours),
        duration_weeks: Number(roadmapForm.duration_weeks),
      };

      const response = await api.post("/learning-roadmap/", payload);

      setRoadmapData(response.data.roadmap);

      setSuccess(
        "Your career roadmap has been generated successfully!"
      );

      setActiveTab("roadmap");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to generate roadmap. Please try again."
      );
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";

    const [year, month, day] = dateString.split("-");
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Learning Goal Input Change
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create Learning Goal
  const handleCreateGoal = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/learning-goals/", {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        skill: formData.skill.trim() || null,
        due_date: formData.due_date,
      });

      setFormData({
        title: "",
        description: "",
        skill: "",
        due_date: "",
      });

      setShowForm(false);
      setSuccess("Your learning goal has been created successfully!");

      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create goal. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Update Learning Goal Completion
  const handleToggleGoal = async (goal) => {
    try {
      setUpdatingId(goal._id);
      setError("");
      setSuccess("");

      await api.put(`/learning-goals/${goal._id}/`, {
        completed: !goal.completed,
      });

      setSuccess(
        !goal.completed
          ? "Congratulations! Goal completed."
          : "Goal moved back to pending."
      );

      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update goal. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Goal Form
  const openGoalForm = () => {
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Update Weekly Roadmap Progress
  const handleToggleWeek = async (weekNumber, completed) => {
    try {
      setUpdatingWeek(weekNumber);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/learning-roadmap/weeks/${weekNumber}/`,
        null,
        {
          params: { completed },
        }
      );

      setRoadmapData(response.data.roadmap);

      setSuccess(
        completed
          ? `Week ${weekNumber} marked as completed!`
          : `Week ${weekNumber} marked as pending.`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update weekly progress."
      );
    } finally {
      setUpdatingWeek(null);
    }
  };

  // Add New Skill
  const handleAddSkill = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!newSkillName.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    try {
      setAddingSkill(true);
      setError("");
      setSuccess("");

      const response = await api.post("/skill-progress/", {
        skill_name: newSkillName.trim(),
        progress: 0,
      });

      setSkills((previous) => [
        ...previous,
        response.data.skill,
      ]);

      setNewSkillName("");

      setSuccess("Skill added successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to add skill. This skill may already exist."
      );
    } finally {
      setAddingSkill(false);
    }
  };

  // Update Skill Progress
  const handleUpdateSkillProgress = async (skill, nextProgress) => {
    try {
      setUpdatingSkillId(skill._id);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/skill-progress/${skill._id}/`,
        {
          progress: Number(nextProgress),
        }
      );

      setSkills((previous) =>
        previous.map((item) =>
          item._id === skill._id ? response.data.skill : item
        )
      );

      setSuccess("Skill progress updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update skill progress."
      );
    } finally {
      setUpdatingSkillId(null);
    }
  };

  return (
    <div className="learning-page">
      <ModuleBackButton/>
      
      {/* Page Header */}
      <div className="learning-header">
        <div>
          <div className="learning-eyebrow">
            <Sparkles size={15} /> AI POWERED CAREER DEVELOPMENT
          </div>

          <h1>Career Roadmap & Learning Tracker</h1>

          <p>
            Build skills, achieve learning goals and move closer to your dream
            career.
          </p>
        </div>

        <button
          className="learning-primary-btn"
          onClick={openGoalForm}
        >
          <Plus size={18} /> Create Learning Goal
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="learning-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="learning-alert success">
          {success}
        </div>
      )}

      {/* Career Roadmap Generator */}
      <section className="learning-panel">
        <div className="learning-panel-heading">
          <div>
            <h3>
              <Sparkles size={19} /> Generate Career Roadmap
            </h3>
            <p>
              Create a personalized learning plan for your target career.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateRoadmap}>
          <label>Target Career Role</label>

          <input
            type="text"
            value={roadmapForm.target_role}
            onChange={(event) =>
              setRoadmapForm({
                ...roadmapForm,
                target_role: event.target.value,
              })
            }
            required
          />

          <label>Current Skills (comma separated)</label>

          <textarea
            rows={2}
            value={roadmapForm.current_skills}
            onChange={(event) =>
              setRoadmapForm({
                ...roadmapForm,
                current_skills: event.target.value,
              })
            }
          />

          <label>Skills You Want to Learn (comma separated)</label>

          <textarea
            rows={3}
            value={roadmapForm.target_skills}
            onChange={(event) =>
              setRoadmapForm({
                ...roadmapForm,
                target_skills: event.target.value,
              })
            }
            required
          />

          <label>Daily Study Hours</label>

          <input
            type="number"
            min="1"
            max="24"
            step="1"
            value={roadmapForm.daily_study_hours}
            onChange={(event) =>
              setRoadmapForm({
                ...roadmapForm,
                daily_study_hours: event.target.value,
              })
            }
            required
          />

          <label>Roadmap Duration (Weeks)</label>

          <input
            type="number"
            min="1"
            max="52"
            value={roadmapForm.duration_weeks}
            onChange={(event) =>
              setRoadmapForm({
                ...roadmapForm,
                duration_weeks: event.target.value,
              })
            }
            required
          />

          <button
            type="submit"
            className="learning-primary-btn"
            disabled={generatingRoadmap}
          >
            {generatingRoadmap ? (
              <>
                <LoaderCircle
                  size={17}
                  className="learning-spinner"
                />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={17} /> Generate My Roadmap
              </>
            )}
          </button>
        </form>

        {roadmapData && (
          <p className="learning-muted">
            Roadmap generated successfully for{" "}
            {roadmapData.target_role || roadmapForm.target_role}.
          </p>
        )}
      </section>

      {/* Create Learning Goal Modal */}
      {showForm && (
        <div className="learning-modal-overlay">
          <div className="learning-modal">
            <div className="learning-modal-heading">
              <div>
                <span className="learning-eyebrow">
                  <Sparkles size={14} /> PERSONAL LEARNING
                </span>

                <h2>Create Learning Goal</h2>
                <p>Add a new target to your career journey.</p>
              </div>

              <button
                type="button"
                className="learning-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal}>
              <label htmlFor="goal-title">Goal Title *</label>

              <input
                id="goal-title"
                name="title"
                type="text"
                placeholder="e.g. Complete Python Functions"
                value={formData.title}
                onChange={handleInputChange}
                minLength={2}
                required
              />

              <label htmlFor="goal-description">Description</label>

              <textarea
                id="goal-description"
                name="description"
                placeholder="What do you want to learn?"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />

              <label htmlFor="goal-skill">Skill</label>

              <input
                id="goal-skill"
                name="skill"
                type="text"
                placeholder="e.g. Python, SQL, React"
                value={formData.skill}
                onChange={handleInputChange}
              />

              <label htmlFor="goal-date">
                Target Completion Date *
              </label>

              <input
                id="goal-date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
              />

              <div className="learning-modal-actions">
                <button
                  type="button"
                  className="learning-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="learning-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="learning-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} /> Save Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Career Hero */}
      <div className="learning-hero">
        <div className="learning-hero-content">
          <span className="learning-hero-label">
            YOUR TARGET CAREER
          </span>

          <h2>
            {roadmapData?.target_role || roadmapForm.target_role}
          </h2>

          <p>
            Turn your career goals into a structured learning journey.
          </p>

          <div className="learning-hero-meta">
            <span>
              <Clock size={15} />
              {roadmapData?.daily_study_hours ??
                roadmapForm.daily_study_hours}{" "}
              Hours / Day
            </span>

            <span>
              <CalendarDays size={15} />
              {roadmapData?.duration_weeks ??
                roadmapForm.duration_weeks}{" "}
              Weeks Plan
            </span>

            <span>
              <Target size={15} />
              {roadmapData?.target_skills?.length ??
                roadmapForm.target_skills
                  .split(",")
                  .filter((skill) => skill.trim()).length}{" "}
              Target Skills
            </span>
          </div>
        </div>

        <div className="learning-hero-icon">
          <Code2 size={66} />
          <Sparkles size={23} />
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="learning-stats">
        <div className="learning-stat-card">
          <div className="learning-stat-icon purple">
            <Map />
          </div>

          <div>
            <span>Roadmap Duration</span>
            <h3>
              {roadmapData?.duration_weeks ??
                roadmapForm.duration_weeks}{" "}
              Weeks
            </h3>
            <small>Career learning plan</small>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon blue">
            <Target />
          </div>

          <div>
            <span>Total Goals</span>
            <h3>{goals.length}</h3>
            <small>Learning targets</small>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon green">
            <CheckCircle2 />
          </div>

          <div>
            <span>Completed Goals</span>
            <h3>{completedGoals}</h3>
            <small>Goals achieved</small>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon orange">
            <TrendingUp />
          </div>

          <div>
            <span>Overall Progress</span>
            <h3>{progress}%</h3>
            <small>Learning completion</small>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="learning-tabs">
        {["overview", "roadmap", "goals", "skills"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="learning-content-grid">
          {/* Learning Progress */}
          <section className="learning-panel">
            <div className="learning-panel-heading">
              <div>
                <h3>Learning Progress</h3>
                <p>Your current learning activity</p>
              </div>

              <TrendingUp size={21} />
            </div>

            {loading ? (
              <p className="learning-muted">
                Loading your progress...
              </p>
            ) : (
              <>
                <div className="learning-progress-number">
                  {progress}%
                </div>

                <div className="learning-progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>

                <p className="learning-muted">
                  You have completed {completedGoals} out of{" "}
                  {goals.length} learning goals.
                </p>

                <div className="learning-progress-details">
                  <span>
                    <CheckCircle2 size={15} /> {completedGoals} Completed
                  </span>

                  <span>
                    <Circle size={15} /> {pendingGoals} Pending
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Career Target */}
          <section className="learning-panel">
            <div className="learning-panel-heading">
              <div>
                <h3>Career Target</h3>
                <p>Your professional destination</p>
              </div>

              <Award size={22} />
            </div>

            <div className="learning-career-target">
              <div className="learning-career-icon">
                <Code2 size={27} />
              </div>

              <div>
                <h4>
                  {roadmapData?.target_role ||
                    roadmapForm.target_role}
                </h4>

                <p>
                  {roadmapData?.duration_weeks ??
                    roadmapForm.duration_weeks}
                  -week structured roadmap
                </p>
              </div>
            </div>

            <div className="learning-career-footer">
              <span>Daily commitment</span>

              <strong>
                {roadmapData?.daily_study_hours ??
                  roadmapForm.daily_study_hours}{" "}
                hours
              </strong>
            </div>
          </section>

          {/* Upcoming Goals */}
          <section className="learning-panel learning-full-panel">
            <div className="learning-panel-heading">
              <div>
                <h3>Upcoming Learning Goals</h3>
                <p>Keep moving forward with your targets</p>
              </div>

              <button
                className="learning-text-btn"
                onClick={() => setActiveTab("goals")}
              >
                View all <ArrowRight size={15} />
              </button>
            </div>

            {loading ? (
              <p className="learning-muted">Loading goals...</p>
            ) : goals.length === 0 ? (
              <p className="learning-muted">
                No learning goals yet. Create your first goal!
              </p>
            ) : (
              goals.slice(0, 3).map((goal) => (
                <div
                  className="learning-goal-row"
                  key={goal._id}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="goal-done" />
                  ) : (
                    <Circle className="goal-pending" />
                  )}

                  <div className="learning-goal-info">
                    <h4>{goal.title}</h4>

                    <span>
                      {goal.skill || "General"} · Due{" "}
                      {formatDate(goal.due_date)}
                    </span>
                  </div>

                  <span
                    className={`learning-status ${
                      goal.completed ? "done" : "pending"
                    }`}
                  >
                    {goal.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {/* ROADMAP TAB */}
      {activeTab === "roadmap" && (
        <section className="learning-panel roadmap-panel">
          <div className="learning-panel-heading">
            <div>
              <h3>
                Your{" "}
                {roadmapData?.duration_weeks ??
                  roadmapForm.duration_weeks}
                -Week Career Roadmap
              </h3>

              <p>A structured path to your target role</p>
            </div>

            <BookOpen size={22} />
          </div>

          {/* Weekly Progress */}
          <div className="learning-weekly-progress">
            <div className="learning-weekly-progress-header">
              <div>
                <h3>Weekly Roadmap Progress</h3>

                <p>
                  {completedWeeks} of {totalWeeks} weeks completed
                </p>
              </div>

              <strong>{weeklyProgress}%</strong>
            </div>

            <div className="learning-weekly-progress-track">
              <div
                className="learning-weekly-progress-fill"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>

            <div className="learning-weekly-summary">
              <div className="learning-summary-item">
                <span>Completed Weeks</span>
                <strong>{completedWeeks}</strong>
              </div>

              <div className="learning-summary-item">
                <span>Pending Weeks</span>
                <strong>{totalWeeks - completedWeeks}</strong>
              </div>
            </div>
          </div>

          {/* Roadmap Timeline */}
          <div className="learning-timeline">
            {roadmap.map((item, index) => {
              const weekNumber = Number(
                item.week.replace("Week ", "")
              );

              return (
                <div
                  className={`learning-timeline-item ${item.status}`}
                  key={item.week}
                >
                  <div className="learning-timeline-marker">
                    {item.status === "completed" ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="learning-timeline-card">
                    <span>{item.week}</span>

                    <h4>{item.title}</h4>

                    <p>{item.skills}</p>

                    <small>
                      {item.status === "completed"
                        ? "Completed"
                        : item.status === "current"
                          ? "In Progress"
                          : "Upcoming"}
                    </small>

                    <button
                      type="button"
                      className="learning-week-toggle"
                      disabled={updatingWeek === weekNumber}
                      onClick={() =>
                        handleToggleWeek(
                          weekNumber,
                          item.status !== "completed"
                        )
                      }
                    >
                      {updatingWeek === weekNumber
                        ? "Updating..."
                        : item.status === "completed"
                          ? "Mark as Pending"
                          : "Mark as Complete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GOALS TAB */}
      {activeTab === "goals" && (
        <section className="learning-panel">
          <div className="learning-panel-heading">
            <div>
              <h3>My Learning Goals</h3>
              <p>Track your personal learning targets</p>
            </div>

            <button
              className="learning-primary-btn"
              onClick={openGoalForm}
            >
              <Plus size={16} /> Add Goal
            </button>
          </div>

          {loading ? (
            <p className="learning-muted">
              Loading your goals...
            </p>
          ) : goals.length === 0 ? (
            <div className="learning-empty">
              <Target size={35} />

              <h3>Start your learning journey</h3>

              <p>
                Create your first learning goal to track your progress.
              </p>

              <button
                className="learning-primary-btn"
                onClick={openGoalForm}
              >
                <Plus size={16} /> Create First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                className="learning-goal-row"
                key={goal._id}
              >
                <button
                  type="button"
                  className="learning-goal-toggle"
                  onClick={() => handleToggleGoal(goal)}
                  disabled={updatingId === goal._id}
                  title={
                    goal.completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                >
                  {updatingId === goal._id ? (
                    <LoaderCircle className="learning-spinner" />
                  ) : goal.completed ? (
                    <CheckCircle2 className="goal-done" />
                  ) : (
                    <Circle className="goal-pending" />
                  )}
                </button>

                <div className="learning-goal-info">
                  <h4>{goal.title}</h4>

                  <span>
                    {goal.skill || "General"} · Due{" "}
                    {formatDate(goal.due_date)}
                  </span>

                  {goal.description && (
                    <p>{goal.description}</p>
                  )}
                </div>

                <span
                  className={`learning-status ${
                    goal.completed ? "done" : "pending"
                  }`}
                >
                  {goal.completed ? "Completed" : "Pending"}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {/* SKILLS TAB */}
      {activeTab === "skills" && (
        <section className="learning-panel learning-skill-panel">
          <div className="learning-panel-heading">
            <div>
              <h3>Skill-wise Progress</h3>
              <p>
                Track how much you have learned in each skill.
              </p>
            </div>

            <TrendingUp size={22} />
          </div>

          {/* Skill Statistics */}
          <div className="learning-skill-stats">
            <div className="learning-skill-stat">
              <span>Total Skills</span>
              <strong>{skills.length}</strong>
            </div>

            <div className="learning-skill-stat">
              <span>Completed Skills</span>
              <strong>{completedSkills}</strong>
            </div>

            <div className="learning-skill-stat">
              <span>Average Progress</span>
              <strong>{averageSkillProgress}%</strong>
            </div>
          </div>

          {/* Add New Skill */}
          <form
            className="learning-skill-add"
            onSubmit={handleAddSkill}
          >
            <input
              type="text"
              placeholder="Enter a skill (e.g. Python, SQL, React)"
              value={newSkillName}
              onChange={(event) =>
                setNewSkillName(event.target.value)
              }
              minLength={2}
              required
            />

            <button
              type="submit"
              className="learning-primary-btn"
              disabled={addingSkill}
            >
              {addingSkill ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="learning-spinner"
                  />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={17} /> Add Skill
                </>
              )}
            </button>
          </form>

          {/* Skills List */}
          {loadingSkills ? (
            <p className="learning-muted">Loading skills...</p>
          ) : skills.length === 0 ? (
            <div className="learning-empty">
              <Code2 size={35} />

              <h3>No skills added yet</h3>

              <p>
                Add your first skill to start tracking your progress.
              </p>
            </div>
          ) : (
            <div className="learning-skill-list">
              {skills.map((skill) => (
                <div
                  className="learning-skill-card"
                  key={skill._id}
                >
                  <div className="learning-skill-card-header">
                    <div>
                      <h4>{skill.skill_name}</h4>

                      <span
                        className={`learning-status ${
                          skill.completed
                            ? "done"
                            : skill.progress > 0
                              ? "pending"
                              : ""
                        }`}
                      >
                        {skill.completed
                          ? "Completed"
                          : skill.progress > 0
                            ? "In Progress"
                            : "Not Started"}
                      </span>
                    </div>

                    <strong>{skill.progress}%</strong>
                  </div>

                  <div className="learning-skill-progress-track">
                    <div
                      className="learning-skill-progress-fill"
                      style={{
                        width: `${skill.progress}%`,
                      }}
                    />
                  </div>

                  <div className="learning-skill-card-footer">
                    <label htmlFor={`skill-progress-${skill._id}`}>
                      Update Progress
                    </label>

                    <select
                      id={`skill-progress-${skill._id}`}
                      value={skill.progress}
                      disabled={updatingSkillId === skill._id}
                      onChange={(event) =>
                        handleUpdateSkillProgress(
                          skill,
                          event.target.value
                        )
                      }
                    >
                      <option value="0">0%</option>
                      <option value="25">25%</option>
                      <option value="50">50%</option>
                      <option value="75">75%</option>
                      <option value="100">100%</option>
                    </select>

                    {updatingSkillId === skill._id && (
                      <span>Updating...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default LearningRoadmap;
