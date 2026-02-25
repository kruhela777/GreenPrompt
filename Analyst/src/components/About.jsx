import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Carousel from "./Carousel/Carousel";
function About() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    // Restore from localStorage on initial render
    return localStorage.getItem("activeSection") || "Dashboard";
  });
  const [stats, setStats] = useState([]);
  const [profileStats, setProfileStats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [profileStatsLoading, setProfileStatsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking"); // 'checking', 'connected', 'failed'

  // Persist activeSection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  // Check if electronAPI is available
  useEffect(() => {
    const checkAPI = async () => {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.ping();
          if (result === "pong") {
            setApiStatus("connected");
          } else {
            setApiStatus("failed");
          }
        } catch (err) {
          console.error("Ping failed:", err);
          setApiStatus("failed");
        }
      } else {
        setApiStatus("failed");
      }
    };
    checkAPI();
  }, []);

  // Load stats when component mounts or API status changes
  useEffect(() => {
    if (apiStatus === "connected") {
      loadStats();
    }
  }, [apiStatus]);

  // Load section-specific data when activeSection or API status changes
  useEffect(() => {
    if (apiStatus === "connected") {
      if (activeSection === "Profile") {
        loadTodayStats();
      } else if (activeSection === "History") {
        loadSessions();
      }
    }
  }, [activeSection, apiStatus]);

  const loadStats = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const result = await window.electronAPI.getDailyStats(
        "user-123",
        lastWeek,
        today,
      );
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadTodayStats = async () => {
    setProfileStatsLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];

      const result = await window.electronAPI.getDailyStats(
        "user-123",
        today,
        today,
      );
      if (result.success) {
        setProfileStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileStatsLoading(false);
    }
  };

  const importSampleSession = async () => {
    if (apiStatus !== "connected") {
      alert("Database not connected");
      return;
    }
    const sampleSession = {
      title: "New chat",
      url: "https://chat.deepseek.com/a/chat/s/38d04255-332b-4db8-8f42-e9a3f06e4953",
      date: new Date().toISOString(),
      messages: [
        { role: "user", content: "What is DBMS?" },
        {
          role: "assistant",
          content: "DBMS stands for Database Management System...",
        },
      ],
    };

    const result = await window.electronAPI.importSession(
      sampleSession,
      "user-123",
    );
    if (result.success) {
      alert("Session imported!");
      loadStats();
    } else {
      alert("Error: " + result.error);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getSessions("user-123");
      if (result.success) {
        setSessions(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleJsonImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Please select a JSON file");
      return;
    }

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Validate required fields
      if (
        !jsonData.title ||
        !jsonData.messages ||
        !Array.isArray(jsonData.messages)
      ) {
        alert("Invalid JSON format. Required fields: title, messages (array)");
        return;
      }

      // Import the session
      const result = await window.electronAPI.importSession(
        jsonData,
        "user-123",
      );
      if (result.success) {
        alert("Session imported successfully!");
        loadStats();
      } else {
        alert("Error importing session: " + result.error);
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }

    // Reset the input
    event.target.value = "";
  };

  // Handles navigation for all sidebar icons
  const handleNav = (section) => (e) => {
    e.preventDefault();
    if (section === "home") {
      navigate("/landing");
    } else {
      setActiveSection(section);
      if (section === "History") {
        loadSessions();
      } else if (section === "Profile") {
        loadTodayStats();
      }
    }
  };

  return (
    <div>
      <>
        <nav>
          <a href="#home" onClick={handleNav("home")}>
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="#Dashboard" onClick={handleNav("Dashboard")}>
            <i className="fa-solid fa-circle-user"></i>
          </a>
          <a href="#Profile" onClick={handleNav("Profile")}>
            <i className="fa-solid fa-user"></i>
          </a>
          <a href="#History" onClick={handleNav("History")}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </a>
        </nav>

        <div className="container">
          {activeSection === "Dashboard" && (
            <section id="Dashboard">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "90%",
                  maxWidth: "1000px",
                  padding: "30px",
                  color: "white",
                }}
              >
                <h1 style={{ marginBottom: "30px", color: "transparent" }}>
                  Alignment tacticsss
                </h1>

                <div style={{ marginBottom: "40px" }}>{<Carousel />}</div>
              </div>
            </section>
          )}
          {activeSection === "Profile" && (
            <section id="Profile">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "90%",
                  maxWidth: "1000px",
                  padding: "30px",
                  color: "white",
                }}
              >
                <h1 style={{ marginBottom: "30px" }}>Profile & Statistics</h1>

                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "25px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    marginBottom: "30px",
                  }}
                >
                  <h2 style={{ marginTop: 0, marginBottom: "15px" }}>
                    User Stats (Today)
                  </h2>
                  <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                    API Status:
                    {apiStatus === "checking" && (
                      <span style={{ color: "orange", marginLeft: "5px" }}>
                        {" "}
                        ⏳ Checking...
                      </span>
                    )}
                    {apiStatus === "connected" && (
                      <span style={{ color: "#00ff00", marginLeft: "5px" }}>
                        {" "}
                        ✅ Connected
                      </span>
                    )}
                    {apiStatus === "failed" && (
                      <span style={{ color: "#ff6b6b", marginLeft: "5px" }}>
                        {" "}
                        ❌ Not connected
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "15px",
                    }}
                  >
                    <button
                      onClick={loadTodayStats}
                      disabled={apiStatus !== "connected"}
                      style={{
                        padding: "8px 16px",
                        background:
                          apiStatus === "connected" ? "#683fea" : "#cccccc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor:
                          apiStatus === "connected" ? "pointer" : "not-allowed",
                        fontSize: "14px",
                      }}
                    >
                      Refresh Stats
                    </button>
                  </div>
                  {profileStatsLoading && <p>Loading stats...</p>}
                  {error && <p style={{ color: "#ff6b6b" }}>Error: {error}</p>}
                  {profileStats.length > 0 && (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "14px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "2px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <th style={{ padding: "10px", textAlign: "left" }}>
                            Date
                          </th>
                          <th style={{ padding: "10px", textAlign: "center" }}>
                            Messages
                          </th>
                          <th style={{ padding: "10px", textAlign: "right" }}>
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileStats.map((day) => (
                          <tr
                            key={day.day}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {day.day}
                            </td>
                            <td
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              {day.message_count}
                            </td>
                            <td style={{ padding: "10px", textAlign: "right" }}>
                              ${day.total_cost?.toFixed(6)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "25px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Profile Settings</h3>
                  <p>Manage your profile and preferences here.</p>

                  <div style={{ marginTop: "20px" }}>
                    <h4 style={{ marginBottom: "10px" }}>
                      Import Chat Session
                    </h4>
                    <p style={{ fontSize: "14px", opacity: 0.8 }}>
                      Import a JSON file containing your chat session to store
                      it in the database.
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleJsonImport}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.1)",
                        color: "white",
                        cursor: "pointer",
                        display: "block",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "13px",
                        opacity: 0.7,
                        marginTop: "10px",
                      }}
                    >
                      Expected format:{" "}
                      {`{ "title": "...", "url": "...", "date": "...", "messages": [...] }`}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeSection === "History" && (
            <section id="History">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "90%",
                  maxWidth: "1200px",
                  padding: "30px",
                  color: "white",
                }}
              >
                <h1 style={{ marginBottom: "30px" }}>Session History & Logs</h1>

                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "25px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h2 style={{ marginTop: 0, marginBottom: 0 }}>
                      All Sessions
                    </h2>
                    <button
                      onClick={loadSessions}
                      disabled={apiStatus !== "connected"}
                      style={{
                        padding: "8px 16px",
                        background:
                          apiStatus === "connected" ? "#683fea" : "#cccccc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor:
                          apiStatus === "connected" ? "pointer" : "not-allowed",
                        fontSize: "14px",
                      }}
                    >
                      Refresh Sessions
                    </button>
                  </div>

                  {sessionsLoading && <p>Loading sessions...</p>}
                  {error && <p style={{ color: "#ff6b6b" }}>Error: {error}</p>}
                  {!sessionsLoading && sessions.length === 0 && (
                    <p style={{ opacity: 0.7 }}>No sessions imported yet</p>
                  )}

                  {sessions.length > 0 && (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "14px",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "2px solid rgba(255,255,255,0.2)",
                            }}
                          >
                            <th style={{ padding: "12px", textAlign: "left" }}>
                              Session Title
                            </th>
                            <th
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              Messages
                            </th>
                            <th style={{ padding: "12px", textAlign: "right" }}>
                              Cost
                            </th>
                            <th style={{ padding: "12px", textAlign: "left" }}>
                              Chat Date
                            </th>
                            <th
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              URL
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((session) => (
                            <tr
                              key={session.id}
                              style={{
                                borderBottom: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  maxWidth: "250px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {session.title}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                }}
                              >
                                {session.message_count || 0}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                }}
                              >
                                ${session.total_cost?.toFixed(6) || "0.000000"}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "left",
                                  fontSize: "13px",
                                }}
                              >
                                {session.started_at
                                  ? new Date(
                                      session.started_at,
                                    ).toLocaleDateString() +
                                    " " +
                                    new Date(
                                      session.started_at,
                                    ).toLocaleTimeString()
                                  : "N/A"}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                }}
                              >
                                {session.url ? (
                                  <a
                                    href={session.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#683fea",
                                      textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.target.style.textDecoration =
                                        "underline")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.target.style.textDecoration = "none")
                                    }
                                  >
                                    Open
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </>
    </div>
  );
}

export default About;
