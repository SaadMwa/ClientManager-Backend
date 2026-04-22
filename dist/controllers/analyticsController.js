import { getRevenue } from "../services/analyticService.js";
export const GetRevenueData = async (req, res) => {
    try {
        // 1) Ensure the request is authenticated
        if (!req.user?.id) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        // 2) Pull real revenue data from MongoDB
        const revenueData = await getRevenue(req.user.id);
        // 3) If no data exists yet, return an empty array (not an error)
        if (!revenueData.length) {
            return res.status(200).json([]);
        }
        // 4) Send back the aggregated revenue data
        return res.status(200).json(revenueData);
    }
    catch (error) {
        console.error("Error fetching revenue data:", error);
        return res.status(500).json({ message: "Error fetching revenue data" });
    }
};
//# sourceMappingURL=analyticsController.js.map