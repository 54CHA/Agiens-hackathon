import axios from "axios";

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = "https://api.deepseek.com/v1";

    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY is required");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  async generateResponse(messages) {
    try {
      const response = await this.client.post("/chat/completions", {
        model: "deepseek-chat",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
      };
    } catch (error) {
      console.error(
        "DeepSeek API Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        throw new Error("Invalid API key");
      } else if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded");
      } else if (error.response?.status >= 500) {
        throw new Error("DeepSeek API server error");
      } else {
        throw new Error("Failed to generate response");
      }
    }
  }

  async generateTitle(message) {
    try {
      const titlePrompt = [
        {
          role: "system",
          content:
            "Generate a short, concise title (max 4-5 words) for a conversation that starts with the following user message. Return only the title, nothing else.",
        },
        {
          role: "user",
          content: message,
        },
      ];

      const response = await this.client.post("/chat/completions", {
        model: "deepseek-chat",
        messages: titlePrompt,
        max_tokens: 20,
        temperature: 0.3,
        stream: false,
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Title generation error:", error.message);
      // Fallback to simple title generation
      const words = message.split(" ").slice(0, 4);
      return words.join(" ") + (message.split(" ").length > 4 ? "..." : "");
    }
  }
}

export default DeepSeekService;
