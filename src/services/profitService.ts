import TimeLog from "../models/timeLog.js";
import ProjectModel from "../models/projectModel.js";

export const calculateProfit = async (
  projectId: string,
  userId: string
) => {
  try {
    // retrieve the project for this user
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const logs = await TimeLog.find({ projectId, userId });

    const actualHours = logs.reduce((sum, log) => sum + log.hoursWorked, 0);

    const effectiveRate =
      actualHours > 0 ? project.agreedPrice / actualHours : 0;

    const scopeCreep =
      project.estimatedHours > 0
        ? ((actualHours - project.estimatedHours) / project.estimatedHours) * 100
        : 0;

    return {
      projectName: project.name,
      estimatedHours: project.estimatedHours,
      actualHours,
      agreedPrice: project.agreedPrice,
      effectiveRate,
      scopeCreep
    };
  } catch (err) {
    throw err;
  }
};

