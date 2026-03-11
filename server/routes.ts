import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { createInvite, acceptInvite, type CreateInviteRequest, type AcceptInviteRequest, type InviteRole } from "./invites";
import { z } from "zod";

// Validation schemas
const createInviteSchema = z.object({
  email: z.string().email(),
  organisation_id: z.string().uuid(),
  venue_id: z.string().uuid().optional(),
  role: z.enum(['ORG_ADMIN', 'HEAD_OFFICE', 'VENUE_MANAGER', 'SUPERVISOR', 'STAFF']),
});

const acceptInviteSchema = z.object({
  token: z.string().uuid(),
});

/**
 * Helper to get authenticated user from request
 * Expects Authorization header with Bearer token from Supabase
 */
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  // In a real app, you would verify the token here
  // For now, we'll return null and let client pass user_id
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint
  app.get(api.health.path, (req, res) => {
    res.json({ status: 'ok' });
  });

  /**
   * POST /api/invites/create
   * Creates a new invite and sends invitation email
   * 
   * Server-side only: Uses Supabase admin API (service role key)
   * Service role key is NEVER exposed to client code
   * 
   * Request body:
   * {
   *   email: string (email)
   *   organisation_id: string (uuid)
   *   venue_id?: string (uuid) - required for venue-level roles
   *   role: 'ORG_ADMIN' | 'HEAD_OFFICE' | 'VENUE_MANAGER' | 'SUPERVISOR' | 'STAFF'
   * }
   */
  app.post('/api/invites/create', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = createInviteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: result.error.errors,
        });
      }

      // Verify user is authenticated (in production, verify JWT)
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: authentication required' });
      }

      // Call invite handler (uses service role key internally)
      const response = await createInvite(result.data);
      res.status(201).json(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('Error in POST /api/invites/create:', err);
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * POST /api/invites/accept
   * Accepts an invite and creates membership rows
   * 
   * Server-side only: Uses Supabase admin API (service role key)
   * Service role key is NEVER exposed to client code
   * 
   * Requires authenticated user (via session cookie or Authorization header)
   * 
   * Request body:
   * {
   *   token: string (uuid) - from /invite/complete?token=...
   *   user_id: string (uuid) - current authenticated user ID
   * }
   */
  app.post('/api/invites/accept', async (req: Request, res: Response) => {
    try {
      // Validate token
      const tokenResult = acceptInviteSchema.safeParse({ token: req.body.token });
      if (!tokenResult.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: tokenResult.error.errors,
        });
      }

      // Get authenticated user ID
      const userId = req.body.user_id;
      if (!userId) {
        return res.status(400).json({ error: 'Missing user_id in request body' });
      }

      // In production, verify userId matches authenticated session
      // For now, we accept it from the request

      // Call accept handler (uses service role key internally)
      const response = await acceptInvite({
        token: tokenResult.data.token,
        user_id: userId,
      });

      res.status(200).json(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('Error in POST /api/invites/accept:', err);
      res.status(400).json({ error: err.message });
    }
  });

  return httpServer;
}
