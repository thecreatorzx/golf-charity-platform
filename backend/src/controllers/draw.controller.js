import {
  runDraw,
  getDrawResultsService,
  getAllDrawsService,
} from "../services/draw.service.js";

// Simulate draw
export const simulateDraw = async (req, res) => {
  try {
    const { month, year, algorithm } = req.body;

    const result = await runDraw(
      Number(month),
      Number(year),
      algorithm || "RANDOM",
      false,
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Publish draw
export const publishDraw = async (req, res) => {
  try {
    const { month, year, algorithm } = req.body;

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      !Number.isInteger(monthNum) ||
      !Number.isInteger(yearNum) ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 2000 ||
      yearNum > 2100
    ) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    const result = await runDraw(
      monthNum,
      yearNum,
      algorithm || "RANDOM",
      true,
    );

    return res.json(result);
  } catch (error) {
    console.error("publishDraw error:", error);

    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Fetch draw results
export const fetchDrawResults = async (req, res) => {
  try {
    const month = Number(req.params.month);
    const year = Number(req.params.year);
    if (!Number.isInteger(month) || !Number.isInteger(year)) {
      return res.status(400).json({ message: "Invalid month/year params" });
    }
    const result = await getDrawResultsService(
      req.userId,
      req.userRole,
      month,
      year,
    );

    return res.json({ draw: result }); // 🔥 FIXED
  } catch (error) {
    if (error.message === "Active subscription required") {
      return res.status(403).json({
        message: "Active subscription required",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    console.error("fetchDrawResults error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Fetch all draws
export const fetchAllDraws = async (req, res) => {
  try {
    const draws = await getAllDrawsService(req.userId, req.userRole);

    res.json({ draws });
  } catch (error) {
    res
      .status(error.message === "Active subscription required" ? 403 : 500)
      .json({ message: error.message || "Server error" });
  }
};
