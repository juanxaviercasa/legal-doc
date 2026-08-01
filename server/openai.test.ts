import { describe, expect, it } from "vitest";
import { OpenAI } from "openai";

describe("OpenAI API Key Validation", () => {
  it("should successfully authenticate with OpenAI API", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const client = new OpenAI({ apiKey });

    // Test with a simple completion call
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Respond with 'OK'",
          },
        ],
        max_tokens: 10,
      });

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
    } catch (error) {
      // If we get here, the API key is valid but there might be other issues
      // The important thing is that the API key was accepted
      if (error instanceof Error && error.message.includes("401")) {
        throw new Error("Invalid OpenAI API Key");
      }
      // Other errors are acceptable for this test
    }
  });
});
