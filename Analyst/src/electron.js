const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

let mainWindow;
let db;

function createWindow() {
  const preloadPath = path.join(__dirname, "../public/preload.js");
  console.log("Preload path:", preloadPath); // Debug log

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools(); // Open DevTools automatically
  }
}

function initializeDatabase() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "chat-history.db");
  console.log("Database path:", dbPath);
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      url TEXT UNIQUE,
      started_at DATETIME,
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      role TEXT,
      content TEXT,
      token_count INTEGER,
      cost REAL,
      created_at DATETIME,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);
  console.log("Database initialized successfully");
}

// IPC Handlers (as before)
ipcMain.handle("import-session", async (event, sessionData, userId) => {
  try {
    const extractIdFromUrl = (url) => {
      const match = url.match(/\/s\/([a-f0-9-]+)/);
      return match ? match[1] : null;
    };

    // Ensure user exists
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    const insertSession = db.prepare(`
      INSERT OR IGNORE INTO sessions (id, user_id, title, url, started_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertMessage = db.prepare(`
      INSERT INTO messages (session_id, role, content, token_count, cost, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((session) => {
      // Create user if doesn't exist
      insertUser.run(userId, `User-${userId}`);

      const sessionId = extractIdFromUrl(session.url) || Date.now().toString();
      insertSession.run(
        sessionId,
        userId,
        session.title,
        session.url,
        session.date,
      );
      for (const msg of session.messages) {
        const tokenCount = Math.ceil(msg.content.length / 4);
        const cost = tokenCount * (msg.role === "user" ? 0.000001 : 0.000002);
        insertMessage.run(
          sessionId,
          msg.role,
          msg.content,
          tokenCount,
          cost,
          session.date,
        );
      }
    });

    transaction(sessionData);
    return { success: true };
  } catch (error) {
    console.error("import-session error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-daily-stats", async (event, userId, startDate, endDate) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        DATE(m.created_at) as day,
        COUNT(*) as message_count,
        SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
        SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages,
        SUM(m.cost) as total_cost
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
      WHERE s.user_id = ? 
        AND DATE(m.created_at) BETWEEN DATE(?) AND DATE(?)
      GROUP BY DATE(m.created_at)
      ORDER BY day DESC
    `);
    const results = stmt.all(userId, startDate, endDate);
    return { success: true, data: results };
  } catch (error) {
    console.error("get-daily-stats error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-total-cost", async (event, userId, startDate, endDate) => {
  try {
    const stmt = db.prepare(`
      SELECT SUM(m.cost) as total_cost
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
      WHERE s.user_id = ?
        AND DATE(m.created_at) BETWEEN DATE(?) AND DATE(?)
    `);
    const result = stmt.get(userId, startDate, endDate);
    return { success: true, data: result };
  } catch (error) {
    console.error("get-total-cost error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-sessions", async (event, userId) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.id,
        s.title,
        s.url,
        s.started_at,
        s.imported_at,
        COUNT(m.id) as message_count,
        SUM(m.cost) as total_cost
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.imported_at DESC
    `);
    const results = stmt.all(userId);
    return { success: true, data: results };
  } catch (error) {
    console.error("get-sessions error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-users", async () => {
  try {
    const stmt = db.prepare("SELECT * FROM users");
    const users = stmt.all();
    return { success: true, data: users };
  } catch (error) {
    console.error("get-users error:", error);
    return { success: false, error: error.message };
  }
});

// Simple ping to check connection
ipcMain.handle("ping", () => {
  return "pong";
});

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
