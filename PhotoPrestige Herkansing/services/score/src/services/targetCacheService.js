import TargetCache from "../models/targetCache.model.js";

/**
 * Save or update a target in cache whenever the Score Service
 * receives a "target_created" event from RabbitMQ.
 */
export async function handleTargetCreated(data) {
  try {
    await TargetCache.findOneAndUpdate(
      { targetId: data.targetId },
      { $set: data },
      { upsert: true, new: true }
    );
    console.log(`💾 Cached target ${data.title} (${data.targetId})`);
  } catch (err) {
    console.error("❌ Failed to cache target:", err.message);
  }
}
