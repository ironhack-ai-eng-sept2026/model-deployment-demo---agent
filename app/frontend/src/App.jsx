import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "./api";

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Where would you like to go? Tell me your destination, dates, interests, and budget—or start with whatever you know.",
};

function Message({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={`message message--${message.role}`}>
      <div className="avatar" aria-hidden="true">
        {isAssistant ? "R" : "You"}
      </div>
      <div>
        <p className="message__author">
          {isAssistant ? "Roamly advisor" : "You"}
        </p>
        <div className="message__bubble">{message.content}</div>
      </div>
    </article>
  );
}

export default function App() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [message, setMessage] = useState("");
  const [previousResponseId, setPreviousResponseId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const composerRef = useRef(null);
  const conversationEndRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      if (!trimmedMessage) {
        setError("Please enter a message before sending.");
        composerRef.current?.focus();
      }
      return;
    }

    const userMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setError("");
    setIsLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const data = await sendChatMessage(
        trimmedMessage,
        previousResponseId,
        controller.signal,
      );

      setMessages((current) => [
        ...current,
        {
          id: data.response_id,
          role: "assistant",
          content: data.answer,
        },
      ]);
      setPreviousResponseId(data.response_id);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(
          requestError.message ||
            "Something went wrong. Please try your message again.",
        );
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
        requestAnimationFrame(() => composerRef.current?.focus());
      }
    }
  }

  function handleNewTrip() {
    requestRef.current?.abort();
    requestRef.current = null;
    setMessages([welcomeMessage]);
    setPreviousResponseId(null);
    setMessage("");
    setError("");
    setIsLoading(false);
    requestAnimationFrame(() => composerRef.current?.focus());
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Roamly home">
          <span className="brand__mark" aria-hidden="true">
            R
          </span>
          <span>Roamly</span>
        </a>
        <button className="new-trip" type="button" onClick={handleNewTrip}>
          <span aria-hidden="true">＋</span> New trip
        </button>
      </header>

      <main className="planner">
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">Your personal travel concierge</p>
          <h1 id="page-title">Let&apos;s plan somewhere unforgettable.</h1>
          <p>
            Share a rough idea or every detail. I&apos;ll ask the right
            questions and turn it into a practical, personalized itinerary.
          </p>
        </section>

        <section className="chat-card" aria-label="Trip planning conversation">
          <div className="conversation" aria-live="polite">
            {messages.map((chatMessage) => (
              <Message key={chatMessage.id} message={chatMessage} />
            ))}

            {isLoading && (
              <article className="message message--assistant">
                <div className="avatar" aria-hidden="true">
                  R
                </div>
                <div>
                  <p className="message__author">Roamly advisor</p>
                  <div className="typing" aria-label="Advisor is thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}
            <div ref={conversationEndRef} />
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="trip-message">
              Message your travel advisor
            </label>
            <textarea
              id="trip-message"
              ref={composerRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleComposerKeyDown}
              placeholder="Tell me about the trip you have in mind…"
              rows="3"
              disabled={isLoading}
            />
            <div className="composer__footer">
              <span className="composer__hint">
                {error || "Press ⌘ + Enter to send"}
              </span>
              <button
                className="send-button"
                type="submit"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? "Planning…" : "Send"}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </section>

        <p className="disclaimer">
          AI plans can make mistakes. Verify prices, hours, and travel
          requirements before you go.
        </p>
      </main>
    </div>
  );
}
