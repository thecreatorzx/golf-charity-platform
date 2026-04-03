import { prisma } from "../lib/prisma.js";
import { calculateCharityAmount } from "../services/subscription.service.js";
import bcrypt from "bcryptjs";

// Dashboard
export const getDashboard = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
        scores: {
          orderBy: { datePlayed: "desc" },
          take: 5,
        },
        charityContribution: {
          include: { charity: true },
        },
        winners: {
          include: {
            drawResult: {
              include: {
                draw: {
                  select: { month: true, year: true },
                },
              },
            },
          },
        },
        drawEntries: {
          include: {
            draw: { select: { month: true, year: true, status: true } },
          },
          orderBy: { draw: { year: "desc" } },
          take: 6,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const charityAmount =
      user.charityContribution && user.subscription
        ? calculateCharityAmount(
            user.subscription.plan,
            user.charityContribution.percentage,
          )
        : 0;

    res.json({
      subscription: user.subscription,
      scores: user.scores,

      // rename charityContribution → charity to match frontend interface
      charity: user.charityContribution
        ? {
            charity: user.charityContribution.charity,
            percentage: user.charityContribution.percentage,
          }
        : null,

      // calculate winnings from winners array
      winnings: {
        total: user.winners.reduce(
          (sum, w) => sum + (w.drawResult?.prizeAmount || 0),
          0,
        ),
        pending: user.winners
          .filter((w) => w.paymentStatus === "PENDING")
          .reduce((sum, w) => sum + (w.drawResult?.prizeAmount || 0), 0),
        paid: user.winners
          .filter((w) => w.paymentStatus === "PAID")
          .reduce((sum, w) => sum + (w.drawResult?.prizeAmount || 0), 0),
      },

      // draws summary
      draws: {
        total: user.drawEntries.length,
        upcoming: user.drawEntries.find((e) => e.draw.status === "PENDING")
          ? `${new Date(0, user.drawEntries.find((e) => e.draw.status === "PENDING").draw.month - 1).toLocaleString("default", { month: "short" })} ${user.drawEntries.find((e) => e.draw.status === "PENDING").draw.year}`
          : "N/A",
      },
      winnerRecords: user.winners.map((w) => ({
        id: w.id,
        matchType: w.drawResult.matchType,
        prizeAmount: w.drawResult?.prizeAmount || 0,
        verificationStatus: w.verificationStatus,
        paymentStatus: w.paymentStatus,
        proofUrl: w.proofUrl,
        draw: {
          month: w.drawResult?.draw?.month,
          year: w.drawResult?.draw?.year,
        },
      })),

      charityAmount,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      name: undefined,
      email: undefined,
      password: undefined,
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);

      if (!valid) {
        return res.status(401).json({ message: "Current password incorrect" });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ user: updated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Upload Winner Proof
export const uploadWinnerProof = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ message: "Proof URL required" });
    }

    const winner = await prisma.winner.findUnique({
      where: { id: winnerId },
    });

    if (!winner || winner.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.winner.update({
      where: { id: winnerId },
      data: { proofUrl },
    });

    res.json({ winner: updated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPublishedDraws = async (_req, res) => {
  try {
    const draws = await prisma.draw.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        results: {
          include: {
            user: { select: { name: true } }, // ← add this
          },
        },
        _count: { select: { entries: true, results: true } },
      },
    });

    // map to shape frontend expects
    const formatted = draws.map((d) => ({
      ...d,
      results: d.results.map((r) => ({
        matchType: r.matchType,
        prizeAmount: r.prizeAmount,
        user: { name: r.user?.name || "Unknown" },
      })),
    }));

    res.json({ draws: formatted });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
