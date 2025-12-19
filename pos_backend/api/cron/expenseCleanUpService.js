import connectDB from "../../config/database.js";
import expense from "../../models/expensesModel.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await expense.deleteMany({
    createdAt: { $lt: startOfToday },
  });

  res.status(200).json({ deleted: result.deletedCount });
}
