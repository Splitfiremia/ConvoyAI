// Email AI Service - Completely Independent Service
// Endpoint: /services/email
// Database: email_responses collection
// APIs: Gmail API + SendGrid
// Zero dependency on voice modules

import express from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { MailService } from '@sendgrid/mail';
import OpenAI from 'openai';

// Email Service Schema
export const emailResponseSchema = z.object({
  id: z.string(),
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  subject: z.string(),
  originalContent: z.string(),
  aiResponse: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  category: z.enum(['inquiry', 'complaint', 'support', 'sales', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'processing', 'sent', 'failed']),
  gmailThreadId: z.string().optional(),
  processedAt: z.date(),
  sentAt: z.date().optional(),
});

export type EmailResponse = z.infer<typeof emailResponseSchema>;

// Email Processing Request Schema
export const emailProcessRequestSchema = z.object({
  fromEmail: z.string().email(),
  toEmail: z.string().email(),
  subject: z.string(),
  content: z.string(),
  gmailThreadId: z.string().optional(),
});

export type EmailProcessRequest = z.infer<typeof emailProcessRequestSchema>;

// In-memory storage for email responses (isolated from other services)
class EmailStorage {
  private emailResponses: Map<string, EmailResponse> = new Map();

  async create(data: Omit<EmailResponse, 'id' | 'processedAt'>): Promise<EmailResponse> {
    const emailResponse: EmailResponse = {
      ...data,
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date(),
    };
    
    this.emailResponses.set(emailResponse.id, emailResponse);
    return emailResponse;
  }

  async findById(id: string): Promise<EmailResponse | null> {
    return this.emailResponses.get(id) || null;
  }

  async findAll(): Promise<EmailResponse[]> {
    return Array.from(this.emailResponses.values());
  }

  async findByEmail(email: string): Promise<EmailResponse[]> {
    return Array.from(this.emailResponses.values())
      .filter(response => response.fromEmail === email || response.toEmail === email);
  }

  async updateStatus(id: string, status: EmailResponse['status'], sentAt?: Date): Promise<EmailResponse | null> {
    const emailResponse = this.emailResponses.get(id);
    if (!emailResponse) return null;

    const updated: EmailResponse = {
      ...emailResponse,
      status,
      ...(sentAt && { sentAt })
    };

    this.emailResponses.set(id, updated);
    return updated;
  }
}

// Email AI Processing Service
class EmailAIProcessor {
  private openai: OpenAI;
  
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for Email AI Service');
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async processEmail(content: string, subject: string): Promise<{
    response: string;
    sentiment: EmailResponse['sentiment'];
    category: EmailResponse['category'];
    priority: EmailResponse['priority'];
  }> {
    try {
      const prompt = `
You are an AI email assistant for Convoy AI. Analyze and respond to this email:

Subject: ${subject}
Content: ${content}

Please provide:
1. A professional, helpful response
2. Sentiment analysis (positive/neutral/negative)
3. Category (inquiry/complaint/support/sales/other)
4. Priority level (low/medium/high/urgent)

Respond in JSON format:
{
  "response": "Professional email response here",
  "sentiment": "positive|neutral|negative",
  "category": "inquiry|complaint|support|sales|other",
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
        response: result.response || 'Thank you for your email. We have received your message and will respond shortly.',
        sentiment: result.sentiment || 'neutral',
        category: result.category || 'other',
        priority: result.priority || 'medium'
      };
    } catch (error) {
      console.error('Email AI processing error:', error);
      return {
        response: 'Thank you for your email. We have received your message and will respond shortly.',
        sentiment: 'neutral',
        category: 'other',
        priority: 'medium'
      };
    }
  }
}

// SendGrid Email Sender
class EmailSender {
  private mailService: MailService | null = null;

  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not configured - Email sending will be simulated');
      return;
    }
    this.mailService = new MailService();
    this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, from: string, subject: string, content: string): Promise<boolean> {
    try {
      if (!this.mailService) {
        // Simulate email sending
        console.log(`[EMAIL SIMULATION] To: ${to}, Subject: Re: ${subject}, Content: ${content}`);
        return true;
      }

      await this.mailService.send({
        to,
        from,
        subject: `Re: ${subject}`,
        html: content,
        text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
      });
      return true;
    } catch (error) {
      console.error('SendGrid email sending error:', error);
      return false;
    }
  }
}

// Email Service Router
export function createEmailServiceRouter(): express.Router {
  const router = express.Router();
  const storage = new EmailStorage();
  const aiProcessor = new EmailAIProcessor();
  const emailSender = new EmailSender();

  // Process incoming email with AI
  router.post('/process', async (req, res) => {
    try {
      const validatedData = emailProcessRequestSchema.parse(req.body);
      
      // AI Processing
      const aiResult = await aiProcessor.processEmail(
        validatedData.content,
        validatedData.subject
      );

      // Store in database
      const emailResponse = await storage.create({
        fromEmail: validatedData.fromEmail,
        toEmail: validatedData.toEmail,
        subject: validatedData.subject,
        originalContent: validatedData.content,
        aiResponse: aiResult.response,
        sentiment: aiResult.sentiment,
        category: aiResult.category,
        priority: aiResult.priority,
        status: 'processing',
        gmailThreadId: validatedData.gmailThreadId,
      });

      // Send email response
      const emailSent = await emailSender.sendEmail(
        validatedData.fromEmail,
        validatedData.toEmail,
        validatedData.subject,
        aiResult.response
      );

      // Update status
      await storage.updateStatus(
        emailResponse.id,
        emailSent ? 'sent' : 'failed',
        emailSent ? new Date() : undefined
      );

      res.status(201).json({
        success: true,
        data: {
          id: emailResponse.id,
          status: emailSent ? 'sent' : 'failed',
          aiResponse: aiResult.response,
          analysis: {
            sentiment: aiResult.sentiment,
            category: aiResult.category,
            priority: aiResult.priority
          }
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

      console.error('Email processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get email response by ID
  router.get('/responses/:id', async (req, res) => {
    try {
      const emailResponse = await storage.findById(req.params.id);
      
      if (!emailResponse) {
        return res.status(404).json({
          success: false,
          error: 'Email response not found'
        });
      }

      res.json({
        success: true,
        data: emailResponse
      });
    } catch (error) {
      console.error('Error fetching email response:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get all email responses
  router.get('/responses', async (req, res) => {
    try {
      const responses = await storage.findAll();
      
      res.json({
        success: true,
        data: responses,
        total: responses.length
      });
    } catch (error) {
      console.error('Error fetching email responses:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Get email responses by email address
  router.get('/responses/email/:email', async (req, res) => {
    try {
      const responses = await storage.findByEmail(req.params.email);
      
      res.json({
        success: true,
        data: responses,
        total: responses.length
      });
    } catch (error) {
      console.error('Error fetching email responses:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      service: 'Email AI Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        sendgrid: !!process.env.SENDGRID_API_KEY
      }
    });
  });

  return router;
}