export const getClientIdFromBody = (body: Record<string, unknown>) => {
  const raw = body.clientId ?? body.client ?? body.client_id;
  if (raw && typeof raw === "object" && "_id" in raw) {
    return String((raw as { _id?: unknown })._id || "");
  }
  return typeof raw === "string" ? raw : "";
};

export const parseOptionalDate = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "invalid" : date;
};
