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

    const result = await runDraw(
      Number(month),
      Number(year),
      algorithm || "RANDOM",
      true,
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Fetch draw results
export const fetchDrawResults = async (req, res) => {
  try {
    const { month, year } = req.params;

    const results = await getDrawResultsService(
      req.userId,
      req.userRole,
      Number(month),
      Number(year),
    );

    res.json({ results });
  } catch (error) {
    res
      .status(error.message === "Active subscription required" ? 403 : 500)
      .json({ message: error.message || "Server error" });
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
