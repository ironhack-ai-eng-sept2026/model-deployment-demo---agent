import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { sendChatMessage } from "./api";

vi.mock("./api", () => ({
  sendChatMessage: vi.fn(),
}));

const welcomePattern = /where would you like to go/i;

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a welcoming trip-planning conversation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /let's plan somewhere unforgettable/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(welcomePattern)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send/i }),
    ).toBeDisabled();
  });

  it("sends a first message and displays the advisor response", async () => {
    const user = userEvent.setup();
    sendChatMessage.mockResolvedValue({
      answer: "What dates are you considering?",
      response_id: "resp_first",
    });
    render(<App />);

    await user.type(
      screen.getByLabelText(/message your travel advisor/i),
      "Plan a food trip to Lisbon",
    );
    await user.click(screen.getByRole("button", { name: /^send/i }));

    expect(sendChatMessage).toHaveBeenCalledWith(
      "Plan a food trip to Lisbon",
      null,
      expect.any(AbortSignal),
    );
    expect(
      await screen.findByText("What dates are you considering?"),
    ).toBeInTheDocument();
  });

  it("chains follow-up messages with the latest response ID", async () => {
    const user = userEvent.setup();
    sendChatMessage
      .mockResolvedValueOnce({
        answer: "When are you going?",
        response_id: "resp_one",
      })
      .mockResolvedValueOnce({
        answer: "Here is your spring itinerary.",
        response_id: "resp_two",
      });
    render(<App />);

    const composer = screen.getByLabelText(/message your travel advisor/i);
    await user.type(composer, "I want to visit Kyoto");
    await user.click(screen.getByRole("button", { name: /^send/i }));
    await screen.findByText("When are you going?");

    await user.type(composer, "Next April");
    await user.click(screen.getByRole("button", { name: /^send/i }));

    await waitFor(() => {
      expect(sendChatMessage).toHaveBeenLastCalledWith(
        "Next April",
        "resp_one",
        expect.any(AbortSignal),
      );
    });
  });

  it("starts a new trip without carrying conversation context", async () => {
    const user = userEvent.setup();
    sendChatMessage
      .mockResolvedValueOnce({
        answer: "What is your budget?",
        response_id: "resp_old",
      })
      .mockResolvedValueOnce({
        answer: "Let's plan Rome.",
        response_id: "resp_new",
      });
    render(<App />);

    const composer = screen.getByLabelText(/message your travel advisor/i);
    await user.type(composer, "Plan Madrid");
    await user.click(screen.getByRole("button", { name: /^send/i }));
    await screen.findByText("What is your budget?");

    await user.click(screen.getByRole("button", { name: /new trip/i }));
    expect(screen.queryByText("Plan Madrid")).not.toBeInTheDocument();
    expect(screen.getByText(welcomePattern)).toBeInTheDocument();

    await user.type(composer, "Plan Rome");
    await user.click(screen.getByRole("button", { name: /^send/i }));

    await waitFor(() => {
      expect(sendChatMessage).toHaveBeenLastCalledWith(
        "Plan Rome",
        null,
        expect.any(AbortSignal),
      );
    });
  });

  it("blocks duplicate submissions while waiting", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    sendChatMessage.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<App />);

    await user.type(
      screen.getByLabelText(/message your travel advisor/i),
      "Plan Porto",
    );
    await user.click(screen.getByRole("button", { name: /^send/i }));

    expect(
      screen.getByRole("button", { name: /planning/i }),
    ).toBeDisabled();
    expect(sendChatMessage).toHaveBeenCalledTimes(1);

    resolveRequest({ answer: "Great choice.", response_id: "resp_porto" });
    expect(await screen.findByText("Great choice.")).toBeInTheDocument();
  });

  it("keeps the user's message visible when the server fails", async () => {
    const user = userEvent.setup();
    sendChatMessage.mockRejectedValue(
      new Error("The AI provider could not process the request."),
    );
    render(<App />);

    await user.type(
      screen.getByLabelText(/message your travel advisor/i),
      "Plan Oslo",
    );
    await user.click(screen.getByRole("button", { name: /^send/i }));

    expect(await screen.findByText("Plan Oslo")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "The AI provider could not process the request.",
      ),
    ).toBeInTheDocument();
  });
});
