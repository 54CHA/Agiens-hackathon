import axios from "axios";

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI2_5_PRO_API_KEY;
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta";

    if (!this.apiKey) {
      throw new Error("GEMINI2_5_PRO_API_KEY is required");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
    });
  }

  async generateResponse(messages) {
    try {
      // Convert messages to Gemini format
      const geminiMessages = this.convertMessagesToGeminiFormat(messages);
      
      const response = await this.client.post(
        `/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        return {
          success: true,
          content: response.data.candidates[0].content.parts[0].text,
          model: "gemini-2.0-flash-exp",
          usage: {
            prompt_tokens: response.data.usageMetadata?.promptTokenCount || 0,
            completion_tokens: response.data.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: response.data.usageMetadata?.totalTokenCount || 0,
          },
        };
      } else {
        return {
          success: false,
          error: "No valid response from Gemini API"
        };
      }
    } catch (error) {
      console.error("Gemini API Error:", error.response?.data || error.message);
      return {
        success: false,
        error: `Gemini API Error: ${error.response?.data?.error?.message || error.message}`
      };
    }
  }

  convertMessagesToGeminiFormat(messages) {
    const geminiMessages = [];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      if (message.role === "system") {
        // For system messages, we'll include them as part of the first user message
        // or create a separate user message if there's no user message yet
        continue; // Handle system messages separately
      }
      
      const role = message.role === "assistant" ? "model" : "user";
      
      // Handle system message by prepending to first user message
      let text = message.content;
      if (i === 0 && messages.some(m => m.role === "system")) {
        const systemMessage = messages.find(m => m.role === "system");
        text = `${systemMessage.content}\n\nUser: ${text}`;
      }
      
      geminiMessages.push({
        role: role,
        parts: [{ text: text }]
      });
    }
    
    return geminiMessages;
  }

  async testConnection() {
    try {
      const testMessages = [
        { role: "user", content: "Hello, this is a test message." }
      ];
      
      await this.generateResponse(testMessages);
      return { success: true, message: "Gemini API connection successful" };
    } catch (error) {
      return { 
        success: false, 
        message: `Gemini API connection failed: ${error.message}` 
      };
    }
  }
}

export default GeminiService; 