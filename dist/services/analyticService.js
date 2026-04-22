import projectModel from "../models/projectModel.js";
export const getRevenue = async (userId) => {
    const pipeline = [
        // 1) Only completed projects for the logged-in user
        {
            $match: {
                userId,
                status: "completed",
                completedAt: { $type: "date", $ne: null },
                agreedPrice: { $type: "number", $gte: 0 },
            },
        },
        // 2) Group by year/month and sum revenue
        {
            $group: {
                _id: {
                    year: { $year: "$completedAt" },
                    month: { $month: "$completedAt" },
                },
                revenue: { $sum: "$agreedPrice" },
            },
        },
        // 3) Sort chronologically
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1,
            },
        },
    ];
    const result = await projectModel.aggregate(pipeline);
    return result;
};
//# sourceMappingURL=analyticService.js.map