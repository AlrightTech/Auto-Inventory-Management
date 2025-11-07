import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Upload a dispatch file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, JPG, PNG, and DOC files are allowed' },
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
    const filePath = `vehicle-dispatch/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vehicle-dispatch')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, return friendly error
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { error: 'Storage bucket not found. Please create the "vehicle-dispatch" bucket in Supabase Storage.' },
          { status: 503 }
        );
      }
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload file. Please ensure the storage bucket exists.');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-dispatch')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      fileUrl: publicUrl,
      fileName: file.name,
      filePath 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading dispatch file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

