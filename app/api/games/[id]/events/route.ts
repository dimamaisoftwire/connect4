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

async function setupSubscription(
  controller: ReadableStreamDefaultController,
  channel: string,
  encoder: TextEncoder,
) {
  const subscriber = redis.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(channel, (message) => {
    const parsed = JSON.parse(message);
    controller.enqueue(encoder.encode(createSseMessage(parsed)));
  });
  return subscriber;
}

function handleDisconnect(
  request: NextRequest,
  subscriber: Awaited<ReturnType<typeof setupSubscription>>,
  channel: string,
  controller: ReadableStreamDefaultController,
) {
  request.signal.addEventListener("abort", () => {
    subscriber.unsubscribe(channel).catch(console.error);
    subscriber.quit().catch(console.error);
    controller.close();
  });
}

function createEventStream(
  request: NextRequest,
  channel: string,
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(createSseMessage({ type: "connected" })),
      );

      const subscriber = await setupSubscription(controller, channel, encoder);
      handleDisconnect(request, subscriber, channel, controller);
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
