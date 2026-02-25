const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload script running");

contextBridge.exposeInMainWorld("electronAPI", {
  importSession: (sessionData, userId) => {
    console.log("IPC invoke: import-session");
    return ipcRenderer.invoke("import-session", sessionData, userId);
  },
  getDailyStats: (userId, startDate, endDate) => {
    console.log("IPC invoke: get-daily-stats");
    return ipcRenderer.invoke("get-daily-stats", userId, startDate, endDate);
  },
  getSessions: (userId) => {
    console.log("IPC invoke: get-sessions");
    return ipcRenderer.invoke("get-sessions", userId);
  },
  getTotalCost: (userId, startDate, endDate) =>
    ipcRenderer.invoke("get-total-cost", userId, startDate, endDate),
  getUsers: () => ipcRenderer.invoke("get-users"),
  // Add a simple connection check
  ping: () => ipcRenderer.invoke("ping"),
});

console.log("electronAPI exposed");
