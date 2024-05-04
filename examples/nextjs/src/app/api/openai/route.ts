import { MARKDOWN_PROMPT, NEWLINE } from "@/constants";
import OpenAI from "openai";

const openai = new OpenAI();

// should be declared (!)
export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: MARKDOWN_PROMPT,
      },
    ],
    stream: true,
  });

  (async () => {
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content;
      if (content !== undefined && content !== null) {
        // avoid newlines getting messed up
        const contentWithNewlines = content.replace(/\n/g, NEWLINE);
        await writer.write(
          encoder.encode(`event: token\ndata: ${contentWithNewlines}\n\n`),
        );
      }
    }

    await writer.write(encoder.encode(`event: finished\ndata: true\n\n`));
    await writer.close();
  })();
  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
};
