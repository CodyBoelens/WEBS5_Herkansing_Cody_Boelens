import Registration from "../models/register.model.js";
import { publishMessage } from "../utils/rabbitmq.js";

export async function registerParticipant(req, res) {
  try {
    const { name, email, role } = req.body;

    const existing = await Registration.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const registration = new Registration({ name, email, role });
    await registration.save();

    // Stuur bericht naar RabbitMQ
    await publishMessage("user_registered", {
      name,
      email,
      role,
      registeredAt: new Date(),
    });

    res.status(201).json({
      message: "Registration successful, message sent to queue",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getAllRegistrations(req, res) {
  try {
    const regs = await Registration.find();
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching registrations" });
  }
}
