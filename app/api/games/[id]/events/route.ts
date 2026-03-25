import { NextRequest } from "next/server";
import { redis } from "@/app/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const channel = `game:${gameId}:updates`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );

      // Create a duplicate connection for subscribing
      const subscriber = redis.duplicate();
      subscriber.connect().then(() => {
        subscriber.subscribe(channel, (message) => {
          controller.enqueue(
            encoder.encode(`data: ${message}\n\n`),
          );
        });
      });

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        subscriber.unsubscribe(channel).catch(console.error);
        subscriber.quit().catch(console.error);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
