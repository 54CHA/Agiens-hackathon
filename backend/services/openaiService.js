import axios from "axios";

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = "https://api.openai.com/v1";

    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required");
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
      console.log("🤖 OpenAI Service: Starting response generation");
      console.log("🔑 API Key present:", !!this.apiKey);
      console.log("📝 Messages count:", messages.length);

      const response = await this.client.post("/chat/completions", {
        model: "gpt-4o", // Using GPT-4o which is the latest available model
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      });

      console.log("📥 OpenAI response status:", response.status);
      console.log("✅ OpenAI response successful");

      return {
        success: true,
        content: response.data.choices[0].message.content,
        model: "gpt-4o",
        usage: {
          prompt_tokens: response.data.usage.prompt_tokens,
          completion_tokens: response.data.usage.completion_tokens,
          total_tokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error("❌ OpenAI API Error:");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "OpenAI API Error";
      
      if (error.response?.status === 401) {
        errorMessage = "Invalid OpenAI API key";
      } else if (error.response?.status === 429) {
        errorMessage = "OpenAI rate limit exceeded";
      } else if (error.response?.status >= 500) {
        errorMessage = "OpenAI API server error";
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: `OpenAI API Error: ${errorMessage}`
      };
    }
  }

  async testConnection() {
    try {
      const testMessages = [
        { role: "user", content: "Hello, this is a test message." }
      ];
      
      const result = await this.generateResponse(testMessages);
      if (result.success) {
        return { success: true, message: "OpenAI API connection successful" };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `OpenAI API connection failed: ${error.message}` 
      };
    }
  }
}

export default OpenAIService;
