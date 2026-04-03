import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

const KISAN_MITRA_SYSTEM_PROMPT = `You are Kisan Mitra, an AI agricultural assistant for Indian farmers, especially those in Andhra Pradesh. 
You help farmers with crop diseases, fertilizers, pesticides, market rates, weather advisories, and farming best practices.
Respond in simple English mixed with Telugu when appropriate. Be concise, practical, and helpful.
Always give actionable advice. Format your responses clearly. Use rupees (₹) for prices.`;

router.get("/gemini/conversations", async (req, res) => {
  try {
    const conversations = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt));
    res.json(conversations);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/gemini/conversations", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  try {
    const [conversation] = await db.insert(conversationsTable).values({ title }).returning();
    res.status(201).json(conversation);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/gemini/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));
    res.json({ ...conversation, messages });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.delete("/gemini/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/gemini/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/gemini/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const { content } = req.body;
  
  if (!content) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content
    });

    const chatHistory = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: KISAN_MITRA_SYSTEM_PROMPT }]
        },
        ...chatHistory.map(m => ({
          role: m.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: m.content }]
        }))
      ],
      config: { maxOutputTokens: 8192 }
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

router.post("/gemini/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }
  try {
    const { generateImage } = await import("@workspace/integrations-gemini-ai/image");
    const result = await generateImage(prompt);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to generate image");
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
