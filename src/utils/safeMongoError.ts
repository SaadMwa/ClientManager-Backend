export const classifyMongoError = (error: unknown) => {
  const err = error as { name?: string; code?: string; codeName?: string; message?: string };
  const message = err.message || "";

  if (err.code === "ENOTFOUND" || err.code === "ETIMEOUT" || /querySrv|ENOTFOUND|ETIMEOUT/i.test(message)) {
    return "DNS lookup failed for the MongoDB host. Confirm the Atlas connection string hostname.";
  }

  if (/Authentication failed|bad auth|auth failed/i.test(message) || err.codeName === "AuthenticationFailed") {
    return "MongoDB authentication failed. Confirm the database username and password.";
  }

  if (/IP.*whitelist|not authorized|network access|ECONNREFUSED|connection timed out|Server selection timed out/i.test(message)) {
    return "MongoDB network access failed. Confirm Atlas Network Access allows this backend environment.";
  }

  if (/Invalid scheme|Invalid connection string|URI malformed/i.test(message)) {
    return "MONGO_URI is malformed. Copy a fresh driver connection string from MongoDB Atlas.";
  }

  return "MongoDB connection failed. Check backend logs and Atlas status without exposing credentials.";
};
