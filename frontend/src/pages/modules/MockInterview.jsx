
import { useState, useRef, useEffect, useCallback } from "react";
import ModuleBackButton from "../../components/ModuleBackButton";

import {
  Brain,
  Sparkles,
  Play,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  RotateCcw,
  Mic,
  Volume2,
  Keyboard,
  Pause,
} from "lucide-react";

import api from "../../services/api";
import "./MockInterview.css";

function MockInterview() {
  const [resumeId, setResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);

  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Interview mode
  const [interviewMode, setInterviewMode] = useState("text");

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Browser voice support
  const voiceSupported =
    typeof window !== "undefined" &&
    Boolean(
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition) &&
        window.speechSynthesis
    );

  // ----------------------------------
  // MICROPHONE SETUP
  // ----------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }

      if (transcript.trim()) {
        setAnswer((previous) =>
          `${previous} ${transcript}`.trim()
        );
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(
          "Microphone error. Please check microphone permission and try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  // ----------------------------------
  // STOP LISTENING
  // ----------------------------------

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
    }

    setIsListening(false);
  };

  // ----------------------------------
  // STOP SPEAKING
  // ----------------------------------

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // ----------------------------------
  // AI INTERVIEWER TEXT TO SPEECH
  // ----------------------------------

  const speakQuestion = useCallback(() => {
    if (!currentQuestion || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      currentQuestion.question
    );

    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [currentQuestion]);

  // ----------------------------------
  // AUTOMATIC QUESTION VOICE
  // ----------------------------------

  useEffect(() => {
    if (
      !sessionId ||
      !currentQuestion ||
      interviewMode !== "voice" ||
      feedback ||
      !voiceSupported
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      speakQuestion();
    }, 300);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [
    currentQuestion,
    sessionId,
    interviewMode,
    feedback,
    voiceSupported,
    speakQuestion,
  ]);

  // ----------------------------------
  // START MICROPHONE
  // ----------------------------------

  const startListening = () => {
    if (!recognitionRef.current) {
      setError(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    setError("");

    try {
      recognitionRef.current.start();
    } catch {
      setError(
        "Microphone is already active. Please try again."
      );
    }
  };

  // ----------------------------------
  // PAUSE MICROPHONE
  // ----------------------------------

  const pauseListening = () => {
    stopListening();
  };

  // ----------------------------------
  // START INTERVIEW
  // ----------------------------------

  const startInterview = async (e) => {
    e.preventDefault();

    setError("");
    setFeedback(null);
    setReport(null);

    if (!resumeId.trim() || !targetRole.trim()) {
      setError("Please enter Resume ID and Target Role.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/mock-interview/start",
        {
          resume_id: resumeId.trim(),
          target_role: targetRole.trim(),
          difficulty,
          question_count: Number(questionCount),
        }
      );

      if (response.data.success) {
        stopListening();
        stopSpeaking();

        setSessionId(response.data.session_id);
        setQuestions(response.data.questions || []);
        setCurrentIndex(0);
        setAnswer("");
        setFeedback(null);
        setReport(null);

        if (!response.data.questions?.length) {
          setError("No interview questions were generated.");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to start interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // SUBMIT ANSWER
  // ----------------------------------

  const submitAnswer = async (e) => {
    e.preventDefault();

    if (!answer.trim() || answer.trim().length < 5) {
      setError("Please provide a meaningful answer.");
      return;
    }

    if (!currentQuestion) {
      setError("Current interview question is unavailable.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      stopListening();
      stopSpeaking();

      const response = await api.post(
        `/mock-interview/${sessionId}/answer`,
        {
          question_id: currentQuestion.question_id,
          question: currentQuestion.question,
          answer: answer.trim(),
        }
      );

      if (response.data.success) {
        setFeedback(response.data.feedback);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to submit answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // NEXT QUESTION
  // ----------------------------------

  const nextQuestion = () => {
    stopListening();
    stopSpeaking();

    setFeedback(null);
    setAnswer("");
    setError("");

    setCurrentIndex((previous) => previous + 1);
  };

  // ----------------------------------
  // FINAL INTERVIEW REPORT
  // ----------------------------------

  const getFinalReport = async () => {
    try {
      setLoading(true);
      setError("");

      stopListening();
      stopSpeaking();

      const response = await api.get(
        `/mock-interview/${sessionId}/report`
      );

      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to generate final report."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // SWITCH INTERVIEW MODE
  // ----------------------------------

  const changeInterviewMode = (mode) => {
    stopListening();
    stopSpeaking();

    setInterviewMode(mode);
    setError("");
  };

  // ----------------------------------
  // RESET INTERVIEW
  // ----------------------------------

  const resetInterview = () => {
    stopListening();
    stopSpeaking();

    setSessionId("");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setReport(null);
    setError("");
    setInterviewMode("text");
  };

  // ----------------------------------
  // WORD COUNT
  // ----------------------------------

  const wordCount = answer
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  // ----------------------------------
  // UI
  // ----------------------------------

  return (
    <div className="mock-interview-page">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b16]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <div className="text-xl font-bold tracking-wide">
            RESUMIND
            <span className="text-violet-400">AI.</span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-300 sm:flex">
            <Sparkles size={14} />
            AI MOCK INTERVIEW
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">

        <ModuleBackButton />

        {/* PAGE INTRO */}

        <section className="mb-9 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-violet-300">
            <Brain size={15} />
            CAREER INTELLIGENCE
          </div>

          <h1 className="text-3xl font-bold sm:text-5xl">
            AI Mock Interview
            <span className="text-violet-400">.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Practice interviews with text or voice,
            receive AI feedback and improve your
            interview performance.
          </p>

        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            <AlertCircle size={19} className="shrink-0" />
            {error}
          </div>
        )}

        {/* INTERVIEW CONFIGURATION */}

        {!sessionId && !report && (

          <section className="rounded-3xl border border-white/10 bg-[#121526] p-6 shadow-2xl sm:p-9">

            <div className="mb-7 flex items-center gap-4">

              <div className="rounded-2xl bg-violet-500/15 p-4 text-violet-300">
                <Brain size={28} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Configure Your Interview
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set your preferences before starting.
                </p>
              </div>

            </div>

            <form onSubmit={startInterview} className="space-y-6">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Resume ID
                </label>

                <input
                  type="text"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  placeholder="Enter your uploaded resume ID"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0e1a] px-4 py-3.5 text-sm outline-none transition focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Target Job Role
                </label>

                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Example: Python Developer"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0e1a] px-4 py-3.5 text-sm outline-none transition focus:border-violet-400"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Interview Difficulty
                  </label>

                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e1a] px-4 py-3.5 text-sm outline-none focus:border-violet-400"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Number of Questions
                  </label>

                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e1a] px-4 py-3.5 text-sm outline-none focus:border-violet-400"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                      (count) => (
                        <option key={count} value={count}>
                          {count} Questions
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={20} />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Play size={19} />
                    Start Mock Interview
                  </>
                )}
              </button>

            </form>

          </section>
        )}

        {/* ACTIVE INTERVIEW */}

        {sessionId && !report && currentQuestion && (

          <section className="space-y-6">

            {/* MODE SELECTOR */}

            <div className="rounded-2xl border border-white/10 bg-[#121526] p-5">

              <h3 className="mb-4 font-semibold text-slate-200">
                Choose Interview Mode
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => changeInterviewMode("text")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition ${
                    interviewMode === "text"
                      ? "border-violet-400 bg-violet-500/20 text-violet-300"
                      : "border-white/10 bg-[#0b0e1a] text-slate-400 hover:border-violet-400/50"
                  }`}
                >
                  <Keyboard size={18} />
                  Text Mode
                </button>

                <button
                  type="button"
                  onClick={() => changeInterviewMode("voice")}
                  disabled={!voiceSupported}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    interviewMode === "voice"
                      ? "border-violet-400 bg-violet-500/20 text-violet-300"
                      : "border-white/10 bg-[#0b0e1a] text-slate-400 hover:border-violet-400/50"
                  }`}
                >
                  <Mic size={18} />
                  Voice Mode
                </button>

              </div>

              <p className="mt-3 text-center text-xs text-slate-400">
                {interviewMode === "voice"
                  ? "Speak your answers using your microphone."
                  : "Type your answers using your keyboard."}
              </p>

              {!voiceSupported && (
                <p className="mt-3 text-center text-xs text-amber-300">
                  Voice recognition is unavailable in this browser.
                  You can still use Text Mode.
                </p>
              )}

            </div>

            {/* PROGRESS */}

            <div className="rounded-2xl border border-white/10 bg-[#121526] p-5">

              <div className="mb-3 flex items-center justify-between text-sm">

                <span className="text-slate-300">
                  Interview Progress
                </span>

                <span className="font-semibold text-violet-300">
                  {currentIndex + 1} / {questions.length}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all"
                  style={{
                    width: `${
                      ((currentIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />

              </div>

            </div>

            {/* QUESTION CARD */}

            <div className="rounded-3xl border border-white/10 bg-[#121526] p-6 sm:p-9">

              <div className="mb-6 flex items-center justify-between">

                <span className="rounded-full bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300">
                  QUESTION {currentIndex + 1}
                </span>

                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} />
                  Practice Session
                </span>

              </div>

              <h2 className="text-xl font-semibold leading-relaxed sm:text-2xl">
                {currentQuestion.question}
              </h2>

              {/* VOICE INTERVIEWER */}

              {interviewMode === "voice" && !feedback && (

                <div className="mt-7 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                      <Brain size={25} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-violet-200">
                        AI Interviewer
                      </h3>

                      <p className="text-xs text-slate-400">
                        {isSpeaking
                          ? "Speaking question..."
                          : isListening
                          ? "Listening to your answer..."
                          : "Ready for your response"}
                      </p>
                    </div>

                    <div className="ml-auto">
                      {isSpeaking ? (
                        <Volume2
                          size={24}
                          className="animate-pulse text-violet-300"
                        />
                      ) : isListening ? (
                        <Mic
                          size={24}
                          className="animate-pulse text-emerald-400"
                        />
                      ) : (
                        <Sparkles
                          size={23}
                          className="text-violet-300"
                        />
                      )}
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={speakQuestion}
                      className="flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-[#0b0e1a] px-3 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                    >
                      <Volume2 size={17} />
                      Repeat Question
                    </button>

                    {isListening ? (
                      <button
                        type="button"
                        onClick={pauseListening}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-3 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/25"
                      >
                        <Pause size={17} />
                        Pause Listening
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startListening}
                        className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                      >
                        <Mic size={17} />
                        Start Speaking
                      </button>
                    )}

                  </div>

                  <p className="mt-4 text-center text-xs text-slate-400">
                    Speak clearly in English. Your recognized
                    answer will appear below.
                  </p>

                </div>
              )}

              {/* ANSWER FORM */}

              {!feedback ? (

                <form
                  onSubmit={submitAnswer}
                  className="mt-8 space-y-5"
                >

                  <label className="block text-sm font-medium text-slate-300">
                    Your Answer
                  </label>

                  <textarea
                    rows={7}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={
                      interviewMode === "voice"
                        ? "Your spoken answer will appear here. You can also edit it..."
                        : "Write your interview answer here..."
                    }
                    className="w-full resize-y rounded-2xl border border-white/10 bg-[#0b0e1a] p-5 text-sm leading-7 outline-none transition focus:border-violet-400"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{wordCount} words</span>
                    <span>Minimum 5 characters</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || answer.trim().length < 5}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" size={19} />
                        Evaluating Answer...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Answer
                      </>
                    )}
                  </button>

                </form>

              ) : (

                /* ANSWER FEEDBACK */

                <div className="mt-8 space-y-6">

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">

                    <div className="mb-3 flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 size={20} />
                      <h3 className="font-semibold">
                        Answer Evaluated
                      </h3>
                    </div>

                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {feedback.score}
                      </span>

                      <span className="text-sm text-slate-400">
                        / 100
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-slate-300">
                      {feedback.feedback}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Word count: {feedback.word_count}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b0e1a] p-5">

                    <h3 className="mb-4 flex items-center gap-2 font-semibold">
                      <Sparkles size={18} className="text-violet-300" />
                      Improvement Suggestions
                    </h3>

                    <ul className="space-y-3">

                      {feedback.suggestions?.map((item, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-6 text-slate-300"
                        >
                          <CheckCircle2
                            size={17}
                            className="mt-1 shrink-0 text-violet-400"
                          />
                          {item}
                        </li>
                      ))}

                    </ul>

                  </div>

                  {/* NEXT OR FINAL REPORT */}

                  {isLastQuestion ? (

                    <button
                      type="button"
                      onClick={getFinalReport}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-semibold disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="animate-spin" size={19} />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Trophy size={19} />
                          View Final Interview Report
                        </>
                      )}
                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500"
                    >
                      Next Question
                      <ChevronRight size={19} />
                    </button>

                  )}

                </div>

              )}

            </div>

          </section>

        )}

        {/* NO QUESTIONS FALLBACK */}

        {sessionId && !report && !currentQuestion && !loading && (
          <div className="rounded-2xl border border-white/10 bg-[#121526] p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-amber-300" size={30} />
            <h2 className="text-lg font-semibold">
              No Interview Questions Available
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Please start a new interview.
            </p>
            <button
              type="button"
              onClick={resetInterview}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* FINAL REPORT */}

        {report && (

          <section className="space-y-6">

            <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 p-7 text-center sm:p-10">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
                <Trophy size={34} />
              </div>

              <p className="text-sm font-semibold tracking-widest text-violet-300">
                INTERVIEW COMPLETED
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Your Performance Report
              </h2>

              <div className="my-7 text-6xl font-bold text-violet-300">
                {report.overall_score}
                <span className="text-2xl text-slate-400">
                  /100
                </span>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                {report.performance_level}
              </span>

            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

              {[
                {
                  label: "Total Questions",
                  value: report.total_questions,
                  icon: Target,
                },
                {
                  label: "Answered",
                  value: report.answered_questions,
                  icon: CheckCircle2,
                },
                {
                  label: "Completion",
                  value: `${report.completion_percentage}%`,
                  icon: Trophy,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-[#121526] p-5"
                  >
                    <Icon
                      className="mb-4 text-violet-300"
                      size={23}
                    />

                    <p className="text-2xl font-bold">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.label}
                    </p>
                  </div>
                );
              })}

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121526] p-6">

              <h3 className="mb-4 font-semibold">
                Individual Answer Scores
              </h3>

              <div className="space-y-4">

                {report.individual_scores?.map((score, index) => (
                  <div key={index}>

                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">
                        Question {index + 1}
                      </span>

                      <strong>{score}/100</strong>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${score}%`,
                        }}
                      />
                    </div>

                  </div>
                ))}

              </div>

            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <p className="text-sm leading-7 text-slate-300">
                <strong className="text-amber-300">
                  Evaluation note:{" "}
                </strong>

                {report.note}
              </p>
            </div>

            <button
              type="button"
              onClick={resetInterview}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500"
            >
              <RotateCcw size={18} />
              Start New Interview
            </button>

          </section>

        )}

      </main>
    </div>
  );
}

export default MockInterview;
