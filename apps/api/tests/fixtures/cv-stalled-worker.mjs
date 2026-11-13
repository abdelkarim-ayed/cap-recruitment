// Timeout/cancellation fixture only. Never used by configured runtime parsing.
process.once('message', () => { setInterval(() => {}, 1000); });
