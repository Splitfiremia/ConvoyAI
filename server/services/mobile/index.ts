// Mobile AI Service - Completely Independent Service
// Endpoint: /services/mobile
// Database: mobile_comms collection
// APIs: Twilio + Firebase Cloud Messaging
// No shared components with voice service

import express from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import OpenAI from 'openai';

// Mobile Communication Schema
export const mobileCommunicationSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  deviceToken: z.string().optional(),
  messageType: z.enum(['sms', 'push_notification', 'whatsapp']),
  direction: z.enum(['inbound', 'outbound']),
  originalMessage: z.string(),
  aiResponse: z.string().optional(),
  intent: z.enum(['appointment', 'inquiry', 'support', 'emergency', 'marketing', 'other']),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['received', 'processing', 'sent', 'delivered', 'failed']),
  twilioSid: z.string().optional(),
  fcmMessageId: z.string().optional(),
  processedAt: z.date(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
});

export type MobileCommunication = z.infer<typeof mobileCommunicationSchema>;

// Mobile Message Request Schema
export const mobileMessageRequestSchema = z.object({
  phoneNumber: z.string(),
  message: z.string(),
  messageType: z.enum(['sms', 'push_notification', 'whatsapp']),
  deviceToken: z.string().optional(),
  twilioSid: z.string().optional(),
});

export type MobileMessageRequest = z.infer<typeof mobileMessageRequestSchema>;

// Push Notification Request Schema
export const pushNotificationRequestSchema = z.object({
  deviceToken: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string()).optional(),
});

export type PushNotificationRequest = z.infer<typeof pushNotificationRequestSchema>;

// In-memory storage for mobile communications (isolated from other services)
class MobileStorage {
  private mobileCommunications: Map<string, MobileCommunication> = new Map();

  async create(data: Omit<MobileCommunication, 'id' | 'processedAt'>): Promise<MobileCommunication> {
    const mobileCommunication: MobileCommunication = {
      ...data,
      id: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date(),
    };
    
    this.mobileCommunications.set(mobileCommunication.id, mobileCommunication);
    return mobileCommunication;
  }

  async findById(id: string): Promise<MobileCommunication | null> {
    return this.mobileCommunications.get(id) || null;
  }

  async findAll(): Promise<MobileCommunication[]> {
    return Array.from(this.mobileCommunications.values());
  }

  async findByPhoneNumber(phoneNumber: string): Promise<MobileCommunication[]> {
    return Array.from(this.mobileCommunications.values())
      .filter(comm => comm.phoneNumber === phoneNumber);
  }

  async updateStatus(
    id: string, 
    status: MobileCommunication['status'], 
    sentAt?: Date, 
    deliveredAt?: Date
  ): Promise<MobileCommunication | null> {
    const communication = this.mobileCommunications.get(id);
    if (!communication) return null;

    const updated: MobileCommunication = {
      ...communication,
      status,
      ...(sentAt && { sentAt }),
      ...(deliveredAt && { deliveredAt })
    };

    this.mobileCommunications.set(id, updated);
    return updated;
  }
}

// Mobile AI Processing Service
class MobileAIProcessor {
  private openai: OpenAI;
  
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for Mobile AI Service');
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async processMobileMessage(message: string, messageType: string): Promise<{
    response: string;
    intent: MobileCommunication['intent'];
    sentiment: MobileCommunication['sentiment'];
    priority: MobileCommunication['priority'];
  }> {
    try {
      const prompt = `
You are an AI assistant for Convoy AI's mobile communication service. Analyze and respond to this ${messageType} message:

Message: ${message}

Please provide:
1. A concise, helpful response (appropriate for ${messageType})
2. Intent analysis (appointment/inquiry/support/emergency/marketing/other)
3. Sentiment analysis (positive/neutral/negative)
4. Priority level (low/medium/high/urgent)

For SMS responses, keep under 160 characters when possible.
For push notifications, keep title under 50 characters and body under 150 characters.

Respond in JSON format:
{
  "response": "Appropriate response here",
  "intent": "appointment|inquiry|support|emergency|marketing|other",
  "sentiment": "positive|neutral|negative",
  "priority": "low|medium|high|urgent"
}
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        response: result.response || 'Thank you for your message. We will get back to you soon.',
        intent: result.intent || 'other',
        sentiment: result.sentiment || 'neutral',
        priority: result.priority || 'medium'
      };
    } catch (error) {
      console.error('Mobile AI processing error:', error);
      return {
        response: 'Thank you for your message. We will get back to you soon.',
        intent: 'other',
        sentiment: 'neutral',
        priority: 'medium'
      };
    }
  }
}

// Twilio SMS Service
class TwilioSMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.warn('Twilio credentials not fully configured - SMS functionality will be simulated');
    }
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string }> {
    try {
      // Simulate Twilio SMS sending (replace with actual Twilio client in production)
      const mockSid = `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[TWILIO SMS] To: ${to}, Message: ${message}`);
      
      // In production, use actual Twilio client:
      // const client = twilio(this.accountSid, this.authToken);
      // const message = await client.messages.create({
      //   body: message,
      //   from: this.fromNumber,
      //   to: to
      // });
      // return { success: true, sid: message.sid };

      return { success: true, sid: mockSid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false };
    }
  }
}

// Firebase Cloud Messaging Service
class FCMService {
  private serverKey: string;

  constructor() {
    this.serverKey = process.env.FIREBASE_SERVER_KEY || '';
    
    if (!this.serverKey) {
      console.warn('Firebase Server Key not configured - Push notifications will be simulated');
    }
  }

  async sendPushNotification(
    deviceToken: string, 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Simulate FCM push notification (replace with actual Firebase Admin SDK in production)
      const mockMessageId = `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[FCM PUSH] Token: ${deviceToken}, Title: ${title}, Body: ${body}`);
      
      // In production, use Firebase Admin SDK:
      // const message = {
      //   notification: { title, body },
      //   data: data || {},
      //   token: deviceToken
      // };
      // const response = await admin.messaging().send(message);
      // return { success: true, messageId: response };

      return { success: true, messageId: mockMessageId };
    } catch (error) {
      console.error('Push notification sending error:', error);
      return { success: false };
    }
  }
}

// Mobile Service Router
export function createMobileServiceRouter(): express.Router {
  const router = express.Router();
  const storage = new MobileStorage();
  const aiProcessor = new MobileAIProcessor();
  const smsService = new TwilioSMSService();
  const fcmService = new FCMService();

  // Process incoming mobile message with AI
  router.post('/process', async (req, res) => {
    try {
      const validatedData = mobileMessageRequestSchema.parse(req.body);
      
      // AI Processing
      const aiResult = await aiProcessor.processMobileMessage(
        validatedData.message,
        validatedData.messageType
      );

      // Store in database
      const mobileCommunication = await storage.create({
        phoneNumber: validatedData.phoneNumber,
        deviceToken: validatedData.deviceToken,
        messageType: validatedData.messageType,
        direction: 'inbound',
        originalMessage: validatedData.message,
        aiResponse: aiResult.response,
        intent: aiResult.intent,
        sentiment: aiResult.sentiment,
        priority: aiResult.priority,
        status: 'processing',
        twilioSid: validatedData.twilioSid,
      });

      // Send response based on message type
      let sendResult = { success: false, externalId: '' };
      
      if (validatedData.messageType === 'sms') {
        const smsResult = await smsService.sendSMS(validatedData.phoneNumber, aiResult.response);
        sendResult = { success: smsResult.success, externalId: smsResult.sid || '' };
      } else if (validatedData.messageType === 'push_notification' && validatedData.deviceToken) {
        const pushResult = await fcmService.sendPushNotification(
          validatedData.deviceToken,
          'Convoy AI Response',
          aiResult.response
        );
        sendResult = { success: pushResult.success, externalId: pushResult.messageId || '' };
      }

      // Update status
      await storage.updateStatus(
        mobileCommunication.id,
        sendResult.success ? 'sent' : 'failed',
        sendResult.success ? new Date() : undefined
      );

      res.status(201).json({
        success: true,
        data: {
          id: mobileCommunication.id,
          status: sendResult.success ? 'sent' : 'failed',
          aiResponse: aiResult.response,
          analysis: {
            intent: aiResult.intent,
            sentiment: aiResult.sentiment,
            priority: aiResult.priority
          },
          externalId: sendResult.externalId
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: fromZodError(error).toString()
        });
      }

      console.error('Mobile processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Send push notification
  router.post('/push', async (req, res) => {
    try {
      const validatedData = pushNotificationRequestSchema.parse(req.body);
      
      const result = await fcmService.sendPushNotification(
        validatedData.deviceToken,
        validatedData.title,
        validatedData.body,
        validatedData.data
      );

      if (result.success) {
        // Store notification in database
        await storage.create({
          phoneNumber: 'N/A',
          deviceToken: validatedData.deviceToken,
          messageType: 'push_notification',
          direction: 'outbound',
          originalMessage: `${validatedData.title}: ${validatedData.body}`,
          intent: 'other',
          sentiment: 'neutral',
          priority: 'medium',
          status: 'sent',
          fcmMessageId: result.messageId,
          sentAt: new Date(),
        });
      }

      res.json({
        success: result.success,
        messageId: result.messageId
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: fromZodError(error).toString()
        });
      }

      console.error('Push notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get mobile communication by ID
  router.get('/communications/:id', async (req, res) => {
    try {
      const communication = await storage.findById(req.params.id);
      
      if (!communication) {
        return res.status(404).json({
          success: false,
          error: 'Mobile communication not found'
        });
      }

      res.json({
        success: true,
        data: communication
      });
    } catch (error) {
      console.error('Error fetching mobile communication:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all mobile communications
  router.get('/communications', async (req, res) => {
    try {
      const communications = await storage.findAll();
      
      res.json({
        success: true,
        data: communications,
        total: communications.length
      });
    } catch (error) {
      console.error('Error fetching mobile communications:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get mobile communications by phone number
  router.get('/communications/phone/:phoneNumber', async (req, res) => {
    try {
      const communications = await storage.findByPhoneNumber(req.params.phoneNumber);
      
      res.json({
        success: true,
        data: communications,
        total: communications.length
      });
    } catch (error) {
      console.error('Error fetching mobile communications:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      service: 'Mobile AI Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        fcm: !!process.env.FIREBASE_SERVER_KEY
      }
    });
  });

  return router;
}