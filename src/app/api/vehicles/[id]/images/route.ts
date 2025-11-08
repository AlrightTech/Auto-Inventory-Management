import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all images for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;

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
    const filePath = fileName; // Don't include bucket name in path

    // Check if bucket exists, create if it doesn't
    const bucketName = 'vehicle-images';
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (!listError && buckets) {
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Try to create the bucket (requires admin privileges)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error('Bucket creation error:', createError);
          // If creation fails, provide helpful error message
          return NextResponse.json(
            { 
              error: 'Storage bucket does not exist and could not be created automatically. Please create the "vehicle-images" bucket in Supabase Dashboard → Storage with public access enabled.',
              details: createError.message 
            },
            { status: 503 }
          );
        }
      }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Storage bucket "vehicle-images" does not exist. Please create it in Supabase Dashboard → Storage with public access enabled.',
            instructions: 'Go to your Supabase Dashboard → Storage → New Bucket → Name: "vehicle-images" → Public: Yes'
          },
          { status: 503 }
        );
      }
      
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
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
      await supabase.storage.from(bucketName).remove([filePath]);
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

