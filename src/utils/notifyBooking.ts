// ─── ntfy.sh Booking Notification Utility ───────────────────────────────────
// Sends a push notification to your ntfy topic BEFORE the DB insert,
// so you always receive booking details even if Supabase fails.
//
// Usage:
//   import { sendBookingNtfy } from "@/utils/notifyBooking";
//   await sendBookingNtfy(formData, { original, discount, final });

export interface BookingNtfyPayload {
  name: string;
  phone: string;
  email?: string;
  address: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  description?: string;
  exact_location?: string;
  coupon_code?: string;
  is_switch_working?: string;
  has_old_fan?: string;
  is_electricity_supply_on?: string;
}

export interface PriceSummary {
  original: number;
  discount: number;
  final: number;
}

// ── CONFIG ─────────────────────────────────────────────────────────────────
// Change NTFY_TOPIC to your actual topic, e.g. "myshop_bookings_prod"
const NTFY_TOPIC = "bookings"; // 🔴 Replace with your real topic name
const NTFY_BASE  = "https://ntfy.sh";
// Optional: set a password-protected topic
// const NTFY_TOKEN = "tk_xxxxx"; // uncomment + add Authorization header if needed
// ───────────────────────────────────────────────────────────────────────────

export async function sendBookingNtfy(
  form: BookingNtfyPayload,
  price: PriceSummary,
  isGuest = false
): Promise<void> {
  const fmt = (v?: string) => v?.trim() || "—";
  const inr = (n: number) => n > 0 ? `₹${n.toFixed(2)}` : "—";

  // ── Build a readable message body ──────────────────────────────────────
  const lines: string[] = [
    `👤 ${fmt(form.name)} | 📞 ${fmt(form.phone)}`,
    `📧 ${fmt(form.email)}`,
    ``,
    `🔧 Service  : ${fmt(form.service_type)}`,
    `📅 Date     : ${fmt(form.preferred_date)} @ ${fmt(form.preferred_time)}`,
    ``,
    `📍 Address  : ${fmt(form.address)}`,
  ];

  if (form.exact_location?.trim()) {
    lines.push(`🗺️  Landmark : ${fmt(form.exact_location)}`);
  }

  if (form.description?.trim()) {
    lines.push(`📝 Notes    : ${fmt(form.description)}`);
  }

  // Fan-specific fields
  if (form.is_switch_working) {
    lines.push(``, `💡 Switch working      : ${form.is_switch_working}`);
  }
  if (form.has_old_fan) {
    lines.push(`🌀 Old fan present     : ${form.has_old_fan}`);
  }
  if (form.is_electricity_supply_on) {
    lines.push(`⚡ Electricity supply  : ${form.is_electricity_supply_on}`);
  }

  // Pricing
  lines.push(``);
  if (price.discount > 0 && form.coupon_code) {
    lines.push(
      `🏷️  Coupon   : ${form.coupon_code}`,
      `💰 Original : ${inr(price.original)}`,
      `🎁 Discount : -${inr(price.discount)}`,
      `✅ Final    : ${inr(price.final)}`
    );
  } else if (price.original > 0) {
    lines.push(`💰 Amount   : ${inr(price.original)}`);
  }

  lines.push(``);
  lines.push(isGuest ? `👤 Guest booking (not logged in)` : `🔐 Registered user`);

  const body = lines.join("\n");

  // ── ntfy headers ───────────────────────────────────────────────────────
  const headers: Record<string, string> = {
    "Content-Type":  "text/plain; charset=utf-8",
    "Title":         `📋 New Booking – ${fmt(form.service_type)}`,
    "Priority":      "high",
    "Tags":          "electric_plug,calendar",
    // Clicking the notification opens a booking management URL (edit as needed)
    "Click":         "https://your-admin-dashboard.com/bookings",
  };

  // Uncomment if your topic requires a token:
  // headers["Authorization"] = `Bearer ${NTFY_TOKEN}`;

  try {
    await fetch(`${NTFY_BASE}/${NTFY_TOPIC}`, {
      method:  "POST",
      headers,
      body,
    });
    // Intentionally not throwing on non-2xx — ntfy failure must never block booking
  } catch (err) {
    // Silent: notification is best-effort
    console.warn("[ntfy] Notification failed (non-blocking):", err);
  }
}