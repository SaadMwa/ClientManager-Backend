import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";
import Time from "../models/timeLog.js";
export const GenerateInsights = async (userId) => {
    const clients = await Client.find({ userId });
    const projects = await Project.find({ userId });
    const time = await Time.find({ userId }).sort({ createdAt: -1 });
    const insights = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = time.filter(log => new Date(log.createdAt) > sevenDaysAgo);
    const totalHours = recentLogs.reduce((sum, log) => sum + log.hoursWorked, 0);
    if (totalHours > 0) {
        insights.push({
            id: `hours-week-${Date.now()}`,
            type: "success",
            message: `⏱️ You logged ${totalHours} hours this week! Keep it up!`,
            action: "/projects"
        });
    }
    const today = new Date();
    const staleProjects = projects.filter(project => {
        if (project.status !== "active")
            return false;
        const lastUpdated = new Date(project.updatedAt);
        const daysSince = Math.floor((today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 30; // Projects not updated in over 30 days
    });
    if (staleProjects.length > 0) {
        insights.push({
            id: `stale-projects-${Date.now()}`,
            type: "warning",
            message: `⚠️ ${staleProjects.length} project${staleProjects.length > 1 ? 's' : ''} hasn't been updated in over 30 days. Time to review!`,
            action: "/projects"
        });
    }
    const average = projects.reduce((sum, project) => sum + project.agreedPrice, 0) / projects.length;
    clients.forEach(client => {
        const clientProjects = projects.filter(p => p.clientId === String(client._id)).reduce((sum, p) => sum + p.agreedPrice, 0);
        if (clientProjects < average) {
            insights.push({
                id: `low-value-client-${client._id}`,
                type: "warning",
                message: `💰 ${client.name} has projects worth $${clientProjects.toFixed(2)}, which is below your average project value!`,
                action: `/clients/${client._id}`
            });
        }
    });
    projects.forEach((project) => {
        const totalLogged = time
            .filter(log => log.projectId === String(project._id))
            .reduce((sum, log) => sum + log.hoursWorked, 0);
        if (totalLogged > project.estimatedHours) {
            insights.push({
                id: `scope-creep-${project._id}`,
                type: "warning",
                message: `⚠️ Project "${project.name}" has exceeded estimated hours (${totalLogged} logged vs ${project.estimatedHours} estimated). Consider reviewing scope!`,
                action: "/projects"
            });
        }
    });
    return insights;
};
//# sourceMappingURL=insightService.js.map