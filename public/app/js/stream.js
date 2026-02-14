import { setPreviousResponseId, previousResponseId } from "./state.js";

export function sseParse(bufferChunk, onEvent) {
  let buffer = bufferChunk;
  let idx;
  while ((idx = buffer.indexOf("\n\n")) !== -1) {
    const raw = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);

    let event = "message";
    let dataLines = [];
    for (const line of raw.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5));
    }
    onEvent(event, dataLines.join("\n"));
  }
  return buffer;
}

export async function sendToBackendStream(message, onDelta, signal) {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ message, previous_response_id: previousResponseId }),
  });
  if (!res.ok || !res.body) throw new Error("Streaming request failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let text = "";
  let nextResponseId = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    buffer = sseParse(buffer, (event, data) => {
      if (event === "delta") {
        text += data;
        onDelta(text);
      } else if (event === "meta" || event === "done") {
        try {
          const obj = JSON.parse(data);
          if (obj.response_id) nextResponseId = obj.response_id;
        } catch {}
      }
    });
  }

  if (nextResponseId) setPreviousResponseId(nextResponseId);
  return nextResponseId;
}
