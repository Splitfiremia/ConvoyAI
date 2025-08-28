import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY must be set for AI services to function");
}
const openai = new OpenAI({ apiKey });

export interface ConversationContext {
  customerName?: string;
  phoneNumber: string;
  purpose?: string;
  conversationHistory: string[];
}

export async function handleAIConversation(
  userMessage: string,
  context: ConversationContext
): Promise<{
  response: string;
  intent: string;
  shouldTransfer: boolean;
  appointmentRequested?: boolean;
  sentiment: { rating: number; confidence: number };
}> {
  try {
    const systemPrompt = `You are an intelligent AI receptionist for a business. Your role is to:
1. Greet callers professionally and warmly
2. Understand their needs and route appropriately
3. Schedule appointments when requested
4. Answer common business questions
5. Transfer to human agents when needed
6. Maintain a helpful, professional tone

Context: Customer ${context.customerName || 'unknown'} calling from ${context.phoneNumber}
Previous conversation: ${context.conversationHistory.slice(-5).join(' ')}

Respond with JSON containing:
- response: Your verbal response to the customer
- intent: The customer's intent (greeting, appointment, question, complaint, transfer_request)
- shouldTransfer: Boolean if human agent is needed
- appointmentRequested: Boolean if they want to schedule
- sentiment: {rating: 1-5, confidence: 0-1}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    
    return {
      response: result.response || "I'm here to help. How can I assist you today?",
      intent: result.intent || "greeting",
      shouldTransfer: result.shouldTransfer || false,
      appointmentRequested: result.appointmentRequested || false,
      sentiment: {
        rating: Math.max(1, Math.min(5, result.sentiment?.rating || 3)),
        confidence: Math.max(0, Math.min(1, result.sentiment?.confidence || 0.5)),
      },
    };
  } catch (error) {
    console.error("OpenAI conversation error:", error);
    return {
      response: "I apologize, but I'm having technical difficulties. Let me transfer you to a human agent.",
      intent: "error",
      shouldTransfer: true,
      sentiment: { rating: 2, confidence: 0.8 },
    };
  }
}

export async function transcribeCall(audioBuffer: Buffer): Promise<string> {
  try {
    // Mock implementation - in real scenario, you'd process the audio buffer
    const mockTranscription = `Customer: Hello, I'd like to schedule an appointment.
AI: Good morning! I'd be happy to help you schedule an appointment. What type of service are you looking for?
Customer: I need a consultation for next week.
AI: Perfect! Let me check our availability for next week. What day works best for you?`;
    
    return mockTranscription;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe call: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { rating: 3, confidence: 0.5 };
  }
}
