import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all images for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const vehicleId = params.id;

    const { data, error } = await supabase
      .from('vehicle_images')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching vehicle images:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST - Upload an image
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const vehicleId = params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `vehicle-images/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, create it (this is a fallback - bucket should be created manually)
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image. Please ensure the storage bucket exists.');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filePath);

    // Save image record to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('vehicle_images')
      .insert({
        vehicle_id: vehicleId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user?.id || null,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('vehicle-images').remove([filePath]);
      throw dbError;
    }

    return NextResponse.json({ data: imageRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading vehicle image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

