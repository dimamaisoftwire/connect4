import { NextRequest } from "next/server";
import { redis } from "@/app/lib/redis";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

function createSseMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function createEventStream(
  request: NextRequest,
  channel: string,
): ReadableStream {
  const encoder = new TextEncoder();
  let closed = false;

  function safeEnqueue(controller: ReadableStreamDefaultController, data: Uint8Array) {
    if (closed) return;
    try {
      controller.enqueue(data);
    } catch {
      closed = true;
    }
  }

  return new ReadableStream({
    async start(controller) {
      safeEnqueue(controller, encoder.encode(createSseMessage({ type: "connected" })));

      const subscriber = redis.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        const parsed = JSON.parse(message);
        safeEnqueue(controller, encoder.encode(createSseMessage(parsed)));
      });

      request.signal.addEventListener("abort", () => {
        closed = true;
        subscriber.unsubscribe(channel).catch(console.error);
        subscriber.quit().catch(console.error);
        controller.close();
      });
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const channel = `game:${gameId}:updates`;
  const stream = createEventStream(request, channel);

  return new Response(stream, { headers: SSE_HEADERS });
}
