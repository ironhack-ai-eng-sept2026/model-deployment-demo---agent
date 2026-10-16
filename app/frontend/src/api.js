const DEFAULT_API_BASE_URL =
  "https://deploymentdemosept26backend.vercel.app";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function getErrorMessage(data, status) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join(", ");
  }

  return `The travel advisor could not respond (${status}).`;
}

export async function sendChatMessage(
  message,
  previousResponseId,
  signal,
) {
  const payload = { message };

  if (previousResponseId) {
    payload.previous_response_id = previousResponseId;
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  if (
    typeof data.answer !== "string" ||
    typeof data.response_id !== "string"
  ) {
    throw new Error("The advisor returned an unexpected response.");
  }

  return data;
}
