export default (domain) => ({
  startSession: (token, data) => domain.sessions.start(token, data),
  restoreSession: (token) => domain.sessions.restore(token),
  endSession: (token) => domain.sessions.end(token),
});
