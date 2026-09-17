import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";
import { classifyMongoError } from "../utils/safeMongoError.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });
const apply = process.argv.includes("--apply");
const auditDir = path.resolve(__dirname, "..", "..", ".audit");
const auditFile = path.join(auditDir, "project-db-audit-last.json");
const emptySummary = () => ({
    totalProjects: 0,
    validObjectIdClientReferences: 0,
    missingClientId: 0,
    malformedClientIdentifiers: 0,
    deletedOrNonexistentClients: 0,
    crossUserClientReferences: 0,
    legacyClientFields: 0,
    validStringObjectIdsConvertible: 0,
    manualReviewRequired: 0,
    convertibleProjectIds: [],
    manualReviewProjectIds: [],
});
const ensureRecentDryRun = () => {
    if (!fs.existsSync(auditFile)) {
        throw new Error("Apply mode refused: run a successful dry-run first.");
    }
    const report = JSON.parse(fs.readFileSync(auditFile, "utf8"));
    const ageMs = Date.now() - new Date(report.createdAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs > 24 * 60 * 60 * 1000) {
        throw new Error("Apply mode refused: dry-run report is older than 24 hours.");
    }
};
const markManualReview = (summary, projectId) => {
    summary.manualReviewRequired += 1;
    if (summary.manualReviewProjectIds.length < 20) {
        summary.manualReviewProjectIds.push(projectId);
    }
};
const main = async () => {
    if (apply) {
        ensureRecentDryRun();
        console.log("Apply mode requested. Confirm you have a recent database backup/export before running this command.");
    }
    else {
        console.log("Dry-run mode: no database changes will be made.");
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
    });
    const summary = emptySummary();
    const projects = await Project.collection.find({}).toArray();
    summary.totalProjects = projects.length;
    for (const project of projects) {
        const projectId = String(project._id);
        const hasLegacyClient = project.client !== undefined || project.client_id !== undefined;
        if (hasLegacyClient)
            summary.legacyClientFields += 1;
        const rawClientId = project.clientId;
        if (!rawClientId) {
            summary.missingClientId += 1;
            markManualReview(summary, projectId);
            continue;
        }
        const isObjectId = rawClientId instanceof mongoose.Types.ObjectId;
        const isValidString = typeof rawClientId === "string" && mongoose.Types.ObjectId.isValid(rawClientId);
        if (!isObjectId && !isValidString) {
            summary.malformedClientIdentifiers += 1;
            markManualReview(summary, projectId);
            continue;
        }
        const clientObjectId = isObjectId ? rawClientId : new mongoose.Types.ObjectId(rawClientId);
        const client = await Client.findById(clientObjectId).select("_id userId").lean();
        if (!client) {
            summary.deletedOrNonexistentClients += 1;
            markManualReview(summary, projectId);
            continue;
        }
        if (String(client.userId) !== String(project.userId)) {
            summary.crossUserClientReferences += 1;
            markManualReview(summary, projectId);
            continue;
        }
        if (isObjectId) {
            summary.validObjectIdClientReferences += 1;
        }
        else {
            summary.validStringObjectIdsConvertible += 1;
            summary.convertibleProjectIds.push(projectId);
        }
    }
    if (apply) {
        const result = await Project.collection.updateMany({ _id: { $in: summary.convertibleProjectIds.map((id) => new mongoose.Types.ObjectId(id)) } }, [{ $set: { clientId: { $toObjectId: "$clientId" } } }]);
        console.log(`Apply summary: converted ${result.modifiedCount} unambiguous project records.`);
    }
    else {
        fs.mkdirSync(auditDir, { recursive: true });
        fs.writeFileSync(auditFile, JSON.stringify({ createdAt: new Date().toISOString(), summary }, null, 2));
    }
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", summary }, null, 2));
};
void main()
    .catch((error) => {
    console.error(classifyMongoError(error));
    process.exitCode = 1;
})
    .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
});
//# sourceMappingURL=projectDbAudit.js.map