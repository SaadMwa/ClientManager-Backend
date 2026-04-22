import { GenerateInsights } from '../services/insightService.js';
const getinsights = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const insights = await GenerateInsights(req.user.id);
        res.json(insights);
    }
    catch (error) {
        console.error("Error generating insights:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export { getinsights };
//# sourceMappingURL=insightController.js.map