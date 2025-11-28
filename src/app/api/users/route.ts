import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all users with role data
    // Try to get with status, but handle gracefully if column doesn't exist
    let users: any[] = [];
    let error: any = null;
    
    const usersQuery = await supabase
      .from('profiles')
      .select('*, role_data:roles(name, is_system_role)')
      .order('created_at', { ascending: false });
    
    users = usersQuery.data || [];
    error = usersQuery.error;
    
    // If error is about missing status column, try without it
    if (error && error.message && error.message.includes('status')) {
      // Try selecting specific columns excluding status
      const usersQueryWithoutStatus = await supabase
        .from('profiles')
        .select('id, email, username, role, role_id, avatar_url, created_at, updated_at, role_data:roles(name, is_system_role)')
        .order('created_at', { ascending: false });
      
      users = (usersQueryWithoutStatus.data || []).map((user: any) => ({
        ...user,
        status: 'active' // Default to active if column doesn't exist
      }));
      error = usersQueryWithoutStatus.error;
    }

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, role, username, status } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'seller', 'transporter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, seller, or transporter' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth using admin client (requires service role key)
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        role,
        username: username || email.split('@')[0],
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData?.user?.id) {
      console.error('User creation succeeded but no user ID returned');
      return NextResponse.json({ error: 'User creation failed - no user ID returned' }, { status: 500 });
    }

    const userId = authData.user.id;

    // Wait a moment for the trigger to potentially create the profile
    // This handles the race condition where the trigger creates the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if profile already exists (created by trigger)
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let profileData;

    // Prepare profile data
    const profileUsername = username?.trim() || email.split('@')[0];
    const profileEmail = email.trim();
    const profileRole = role; // Must be one of: 'admin', 'seller', 'transporter'
    const profileStatus = status && ['active', 'inactive'].includes(status) ? status : 'active';

    if (existingProfile && !checkError) {
      // Profile already exists (created by trigger), update it with our values
      const profileUpdate: any = {
        email: profileEmail,
        role: profileRole,
        username: profileUsername,
        updated_at: new Date().toISOString(),
      };

      // Add status if column exists
      profileUpdate.status = profileStatus;

      console.log('Updating existing profile:', { userId, profileUpdate });

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating existing profile:', {
          error: updateError,
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          userId,
          profileUpdate
        });
        
        // Only rollback if it's a critical error (not a constraint violation we can handle)
        const isCriticalError = !updateError.code || 
          (updateError.code !== '23505' && // Not duplicate key
           updateError.code !== '23503' && // Not foreign key violation
           updateError.code !== '23514'); // Not check constraint violation
        
        if (isCriticalError) {
          // Rollback: delete the auth user since profile update failed
          try {
            await adminClient.auth.admin.deleteUser(userId);
            console.log('Rolled back user creation due to critical error');
          } catch (deleteError) {
            console.error('Error rolling back user creation:', deleteError);
          }
          return NextResponse.json({ 
            error: `Failed to update user profile: ${updateError.message || 'Unknown error'}. User account has been removed.`,
            details: updateError.details,
            code: updateError.code
          }, { status: 500 });
        } else {
          // Constraint error - try to provide helpful message without deleting user
          return NextResponse.json({ 
            error: `Failed to update user profile: ${updateError.message || 'Constraint violation'}`,
            details: updateError.details,
            code: updateError.code
          }, { status: 400 });
        }
      }

      profileData = updatedProfile;
    } else {
      // Profile doesn't exist, create it
      const profileInsert: any = {
        id: userId,
        email: profileEmail,
        role: profileRole,
        username: profileUsername,
        status: profileStatus,
      };

      console.log('Creating new profile:', { userId, profileInsert });

      const { data: createdProfile, error: profileCreateError } = await supabase
        .from('profiles')
        .insert(profileInsert)
        .select()
        .single();

      if (profileCreateError) {
        console.error('Error creating profile:', {
          error: profileCreateError,
          code: profileCreateError.code,
          message: profileCreateError.message,
          details: profileCreateError.details,
          hint: profileCreateError.hint,
          userId,
          profileInsert
        });
        
        // Check if it's a duplicate key error (profile was created by trigger between check and insert)
        if (profileCreateError.code === '23505' || profileCreateError.message?.includes('duplicate')) {
          // Profile was created by trigger, fetch it
          const { data: triggerProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (fetchError || !triggerProfile) {
            // Still can't find profile, rollback
            try {
              await adminClient.auth.admin.deleteUser(userId);
              console.log('Rolled back user creation - profile not found after duplicate error');
            } catch (deleteError) {
              console.error('Error rolling back user creation:', deleteError);
            }
            return NextResponse.json({ 
              error: 'Failed to create user profile. User account has been removed.' 
            }, { status: 500 });
          }

          // Update the trigger-created profile with our values
          const profileUpdate: any = {
            email: profileEmail,
            role: profileRole,
            username: profileUsername,
            status: profileStatus,
            updated_at: new Date().toISOString(),
          };

          console.log('Updating trigger-created profile:', { userId, profileUpdate });

          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating trigger-created profile:', {
              error: updateError,
              code: updateError.code,
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint
            });
            
            // Only rollback on critical errors
            const isCriticalError = !updateError.code || 
              (updateError.code !== '23505' && 
               updateError.code !== '23503' && 
               updateError.code !== '23514');
            
            if (isCriticalError) {
              try {
                await adminClient.auth.admin.deleteUser(userId);
                console.log('Rolled back user creation due to critical update error');
              } catch (deleteError) {
                console.error('Error rolling back user creation:', deleteError);
              }
              return NextResponse.json({ 
                error: `Failed to update user profile: ${updateError.message || 'Unknown error'}. User account has been removed.`,
                details: updateError.details,
                code: updateError.code
              }, { status: 500 });
            } else {
              // Constraint error - don't delete user, just return error
              return NextResponse.json({ 
                error: `Failed to update user profile: ${updateError.message || 'Constraint violation'}`,
                details: updateError.details,
                code: updateError.code
              }, { status: 400 });
            }
          }

          profileData = updatedProfile;
        } else {
          // Different error - check if it's a constraint violation
          const isCriticalError = !profileCreateError.code || 
            (profileCreateError.code !== '23505' && 
             profileCreateError.code !== '23503' && 
             profileCreateError.code !== '23514');
          
          if (isCriticalError) {
            // Rollback only on critical errors
            try {
              await adminClient.auth.admin.deleteUser(userId);
              console.log('Rolled back user creation due to critical insert error');
            } catch (deleteError) {
              console.error('Error rolling back user creation:', deleteError);
            }
            return NextResponse.json({ 
              error: `Failed to create user profile: ${profileCreateError.message || 'Unknown error'}. User account has been removed.`,
              details: profileCreateError.details,
              code: profileCreateError.code
            }, { status: 500 });
          } else {
            // Constraint violation - don't delete user
            return NextResponse.json({ 
              error: `Failed to create user profile: ${profileCreateError.message || 'Constraint violation'}`,
              details: profileCreateError.details,
              code: profileCreateError.code
            }, { status: 400 });
          }
        }
      } else {
        profileData = createdProfile;
      }
    }

    // Verify profile was created/updated successfully
    if (!profileData) {
      console.error('Profile data is null after creation/update');
      try {
        await adminClient.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('Error rolling back user creation:', deleteError);
      }
      return NextResponse.json({ 
        error: 'Failed to create user profile. User account has been removed.' 
      }, { status: 500 });
    }

    return NextResponse.json({ data: profileData }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





