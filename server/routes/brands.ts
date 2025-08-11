import { Router } from 'express';
import { db } from '../db';
import { brands, brandSettings, subscriptions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { insertBrandSchema, insertBrandSettingsSchema } from '@shared/schema';

const router = Router();

// Get current user's brand
router.get('/current', async (req, res) => {
  try {
    // For now, create a default brand if none exists
    // In production, this would be tied to the authenticated user
    const defaultBrandId = 'default-brand-id';
    
    let [brand] = await db.select().from(brands).where(eq(brands.id, defaultBrandId));
    
    if (!brand) {
      // Create default brand
      [brand] = await db.insert(brands).values({
        id: defaultBrandId,
        name: 'My Company',
        subdomain: 'mycompany',
        companyName: 'My Company',
        supportEmail: 'support@mycompany.com',
        whiteLabelEnabled: false,
      }).returning();
    }
    
    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update brand settings
router.patch('/current', async (req, res) => {
  try {
    const data = insertBrandSchema.partial().parse(req.body);
    const brandId = 'default-brand-id'; // In production, get from authenticated user
    
    const [updatedBrand] = await db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, brandId))
      .returning();
    
    res.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Get brand settings for all services
router.get('/settings', async (req, res) => {
  try {
    const brandId = 'default-brand-id'; // In production, get from authenticated user
    
    const settings = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.brandId, brandId));
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update service-specific settings
router.post('/settings', async (req, res) => {
  try {
    const { serviceType, settings } = req.body;
    const brandId = 'default-brand-id'; // In production, get from authenticated user
    
    if (!serviceType || !settings) {
      return res.status(400).json({ error: 'serviceType and settings are required' });
    }
    
    // Check if settings already exist
    const [existingSetting] = await db
      .select()
      .from(brandSettings)
      .where(
        and(
          eq(brandSettings.brandId, brandId),
          eq(brandSettings.serviceType, serviceType)
        )
      );
    
    if (existingSetting) {
      // Update existing settings
      const [updated] = await db
        .update(brandSettings)
        .set({
          settings: { [serviceType]: settings },
          updatedAt: new Date(),
        })
        .where(eq(brandSettings.id, existingSetting.id))
        .returning();
      
      res.json(updated);
    } else {
      // Create new settings
      const [created] = await db
        .insert(brandSettings)
        .values({
          brandId,
          serviceType,
          settings: { [serviceType]: settings },
        })
        .returning();
      
      res.json(created);
    }
  } catch (error) {
    console.error('Error updating brand settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Enable/disable white label
router.post('/white-label/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    const brandId = 'default-brand-id'; // In production, get from authenticated user
    const userId = 'default-user-id'; // In production, get from authenticated user
    
    // Update brand
    await db
      .update(brands)
      .set({ whiteLabelEnabled: enabled, updatedAt: new Date() })
      .where(eq(brands.id, brandId));
    
    // Update subscription if exists
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    
    if (subscription) {
      await db
        .update(subscriptions)
        .set({ whiteLabelAddon: enabled })
        .where(eq(subscriptions.id, subscription.id));
    } else {
      // Create subscription with white label addon
      await db.insert(subscriptions).values({
        userId,
        brandId,
        plan: 'professional',
        whiteLabelAddon: enabled,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }
    
    res.json({ success: true, whiteLabelEnabled: enabled });
  } catch (error) {
    console.error('Error toggling white label:', error);
    res.status(500).json({ error: 'Failed to toggle white label' });
  }
});

export default router;