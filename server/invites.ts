import { supabaseAdmin } from './supabase';
import { randomUUID } from 'crypto';

export type InviteRole = 'ORG_ADMIN' | 'HEAD_OFFICE' | 'VENUE_MANAGER' | 'SUPERVISOR' | 'STAFF';

export interface CreateInviteRequest {
  email: string;
  organisation_id: string;
  venue_id?: string;
  role: InviteRole;
}

export interface AcceptInviteRequest {
  token: string;
  user_id: string;
}

/**
 * Creates an invite and sends it via Supabase magic link
 * Uses server-side Supabase admin client (service role key)
 * IMPORTANT: Service role key is NEVER exposed to client
 */
export async function createInvite(req: CreateInviteRequest) {
  try {
    // Generate invite token
    const token = randomUUID();

    // Create row in invites table
    const { error: insertError } = await supabaseAdmin
      .from('invites')
      .insert({
        token,
        email: req.email.toLowerCase(),
        organisation_id: req.organisation_id,
        venue_id: req.venue_id || null,
        role: req.role,
        created_at: new Date().toISOString(),
        accepted_at: null,
      });

    if (insertError) throw insertError;

    // Invite user via Supabase admin API
    // This sends a magic link email to the user with redirectTo pointing to /invite/complete
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      req.email,
      {
        redirectTo: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/invite/complete?token=${token}`,
      }
    );

    if (inviteError) throw inviteError;

    return {
      success: true,
      inviteId: token,
      message: `Invitation sent to ${req.email}`,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Error creating invite:', err);
    throw err;
  }
}

/**
 * Accepts an invite and creates appropriate membership rows
 * Requires authenticated user (verified via Supabase session)
 * Uses server-side Supabase admin client to validate token and create memberships
 * IMPORTANT: Service role key is NEVER exposed to client
 */
export async function acceptInvite(req: AcceptInviteRequest) {
  try {
    // Fetch invite by token
    const { data: inviteData, error: fetchError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('token', req.token)
      .single();

    if (fetchError || !inviteData) {
      throw new Error('Invalid or expired invite token');
    }

    if (inviteData.accepted_at) {
      throw new Error('This invite has already been used');
    }

    // Verify the user's email matches the invite email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      req.user_id
    );

    if (userError || !userData?.user) {
      throw new Error('User not found');
    }

    if (userData.user.email?.toLowerCase() !== inviteData.email.toLowerCase()) {
      throw new Error('Email mismatch: your account email does not match the invitation');
    }

    // Create appropriate membership row based on role
    if (inviteData.role === 'ORG_ADMIN' || inviteData.role === 'HEAD_OFFICE') {
      // Create org-level membership
      const { error: membershipError } = await supabaseAdmin
        .from('memberships')
        .insert({
          user_id: req.user_id,
          organisation_id: inviteData.organisation_id,
          role: inviteData.role,
          created_at: new Date().toISOString(),
        });

      if (membershipError) throw membershipError;
    } else if (inviteData.role === 'VENUE_MANAGER' || inviteData.role === 'SUPERVISOR' || inviteData.role === 'STAFF') {
      // Create venue-level membership
      if (!inviteData.venue_id) {
        throw new Error('Venue ID is required for this role');
      }

      const { error: venueMembershipError } = await supabaseAdmin
        .from('venue_memberships')
        .insert({
          user_id: req.user_id,
          venue_id: inviteData.venue_id,
          role: inviteData.role,
          created_at: new Date().toISOString(),
        });

      if (venueMembershipError) throw venueMembershipError;
    }

    // Mark invite as accepted
    const { error: acceptError } = await supabaseAdmin
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', req.token);

    if (acceptError) throw acceptError;

    return {
      success: true,
      message: 'Invite accepted successfully',
      role: inviteData.role,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Error accepting invite:', err);
    throw err;
  }
}
