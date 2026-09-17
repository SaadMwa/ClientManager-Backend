export const getClientIdFromBody = (body) => {
    const raw = body.clientId ?? body.client ?? body.client_id;
    if (raw && typeof raw === "object" && "_id" in raw) {
        return String(raw._id || "");
    }
    return typeof raw === "string" ? raw : "";
};
export const parseOptionalDate = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null || value === "")
        return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? "invalid" : date;
};
//# sourceMappingURL=projectValidation.js.map