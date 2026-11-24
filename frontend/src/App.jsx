
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import ResumeAnalyzer from "./pages/modules/ResumeAnalyzer";
import JobMatching from "./pages/modules/JobMatching";
import SkillGap from "./pages/modules/SkillGap";
import ResumeBuilder from "./pages/modules/ResumeBuilder";
import MockInterview from "./pages/modules/MockInterview";
import CareerAgent from "./pages/modules/CareerAgent";
import JobRecommendations from "./pages/modules/JobRecommendations";
import ResumeVersions from "./pages/modules/ResumeVersions";
import ResumeComparison from "./pages/modules/ResumeComparison";
import ATSTracker from "./pages/modules/ATSTracker";
import ResumeAnalytics from "./pages/modules/ResumeAnalytics";
import LearningRoadmap from "./pages/modules/LearningRoadmap";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/dashboard/resume-analyzer"
          element={<ResumeAnalyzer />}
        />

        <Route
          path="/dashboard/job-matching"
          element={<JobMatching />}
        />

        <Route
          path="/dashboard/skill-gap"
          element={<SkillGap />}
        />

        <Route
          path="/dashboard/resume-builder"
          element={<ResumeBuilder />}
        />
        <Route
        path="/dashboard/career-agent"
        element={<CareerAgent />}
        />
        <Route
        path="/dashboard/job-recommendations"
        element={<JobRecommendations />}
        />

        <Route path="/dashboard/mock-interview" element={<MockInterview />} />
          <Route
        path="/dashboard/resume-versions"
        element={<ResumeVersions />}
      />

<Route
  path="/dashboard/ats-tracker"
  element={<ATSTracker />}
/>
      <Route
  path="/dashboard/resume-comparison"
  element={<ResumeComparison />}
/>

<Route
  path="/dashboard/learning-roadmap"
  element={<LearningRoadmap />}
/>

<Route
  path="/dashboard/resume-analytics"
  element={<ResumeAnalytics />}
/>

      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
