import {
  getAllCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  setUserCharity,
  getUserCharity,
} from "../services/charity.service.js";

export const listCharities = async (req, res) => {
  try {
    const { search } = req.query;
    const charities = await getAllCharities(search);
    res.json({ charities });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCharity = async (req, res) => {
  try {
    const charity = await getCharityById(req.params.id);
    if (!charity) {
      res.status(404).json({ message: "Charity not found" });
      return;
    }
    res.json({ charity });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const addCharity = async (req, res) => {
  try {
    const { name, description, imageUrl, website, featured } = req.body;
    if (!name || !description) {
      res.status(400).json({ message: "Name and description required" });
      return;
    }
    const charity = await createCharity({
      name,
      description,
      imageUrl,
      website,
      featured,
    });
    res.status(201).json({ charity });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const editCharity = async (req, res) => {
  try {
    const charity = await updateCharity(req.params.id, req.body);
    res.json({ charity });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeCharity = async (req, res) => {
  try {
    await deleteCharity(req.params.id);
    res.json({ message: "Charity deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const selectUserCharity = async (req, res) => {
  try {
    const { charityId, percentage } = req.body;
    if (!charityId) {
      res.status(400).json({ message: "Charity ID required" });
      return;
    }
    const contribution = await setUserCharity(
      req.userId,
      charityId,
      percentage || 10,
    );
    const fullContribution = await getUserCharity(req.userId);
    res.json({
      charity: fullContribution.charity,
      percentage: fullContribution.percentage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Server error" });
  }
};

export const fetchUserCharity = async (req, res) => {
  try {
    const contribution = await getUserCharity(req.userId);
    if (!contribution) {
      return res.json(null);
    }

    res.json({
      charity: contribution.charity,
      percentage: contribution.percentage,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
export const donateToCharity = async (req, res) => {
  try {
    const { charityId, amount } = req.body;
    if (!charityId || !amount) {
      res.status(400).json({ message: "Charity and amount required" });
      return;
    }
    // In production this would trigger a Razorpay order
    // For now log the intent and return success
    res.json({
      message: "Donation recorded",
      charityId,
      amount,
      note: "Payment gateway integration pending",
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
