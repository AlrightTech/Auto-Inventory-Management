import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { VehicleInsert, ImportResult } from '@/types/vehicle';
import * as XLSX from 'xlsx';
const pdf = require('pdf-parse');

// Helper function to parse CSV content
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

// Helper function to map CSV/Excel data to vehicle schema
function mapToVehicleSchema(row: any): VehicleInsert {
  return {
    vin: row['VIN'] || row['vin'] || undefined,
    year: parseInt(row['Year'] || row['year'] || '0') || undefined,
    make: row['Make'] || row['make'] || undefined,
    model: row['Model'] || row['model'] || undefined,
    trim: row['Trim'] || row['trim'] || undefined,
    exterior_color: row['Exterior Color'] || row['exterior_color'] || undefined,
    interior_color: row['Interior Color'] || row['interior_color'] || undefined,
    status: (row['Status'] || row['status'] || 'Pending') as any,
    odometer: parseInt(row['Odometer'] || row['odometer'] || '0') || undefined,
    title_status: (row['Title Status'] || row['title_status'] || 'Absent') as any,
    psi_status: row['PSI Status'] || row['psi_status'] || 'Not Eligible',
    dealshield_arbitration_status: row['Dealshield Arbitration Status'] || row['dealshield_arbitration_status'] || '--',
    bought_price: parseFloat(row['Bought Price'] || row['bought_price'] || '0') || undefined,
    buy_fee: parseFloat(row['Buy Fee'] || row['buy_fee'] || '0') || undefined,
    other_charges: parseFloat(row['Other Charges'] || row['other_charges'] || '0') || undefined,
    sale_date: row['Sale Date'] || row['sale_date'] || undefined,
    lane: parseInt(row['Lane'] || row['lane'] || '0') || undefined,
    run: parseInt(row['Run'] || row['run'] || '0') || undefined,
    channel: row['Channel'] || row['channel'] || 'Simulcast',
    facilitating_location: row['Facilitating Location'] || row['facilitating_location'] || undefined,
    vehicle_location: row['Vehicle Location'] || row['vehicle_location'] || undefined,
    pickup_location_address1: row['Pickup Location Address1'] || row['pickup_location_address1'] || undefined,
    pickup_location_city: row['Pickup Location City'] || row['pickup_location_city'] || undefined,
    pickup_location_state: row['Pickup Location State'] || row['pickup_location_state'] || undefined,
    pickup_location_zip: row['Pickup Location Zip'] || row['pickup_location_zip'] || undefined,
    pickup_location_phone: row['Pickup Location Phone'] || row['pickup_location_phone'] || undefined,
    seller_name: row['Seller Name'] || row['seller_name'] || undefined,
    buyer_dealership: row['Buyer Dealership'] || row['buyer_dealership'] || undefined,
    buyer_contact_name: row['Buyer Contact Name'] || row['buyer_contact_name'] || undefined,
    buyer_aa_id: row['Buyer AA ID'] || row['buyer_aa_id'] || undefined,
    buyer_reference: row['Buyer Reference'] || row['buyer_reference'] || undefined,
    sale_invoice_status: (row['Sale Invoice Status'] || row['sale_invoice_status'] || 'UNPAID') as any,
  };
}

// Helper function to validate vehicle data
function validateVehicle(vehicle: VehicleInsert, index: number): string[] {
  const errors: string[] = [];

  if (!vehicle.make) {
    errors.push(`Row ${index + 1}: Make is required`);
  }
  if (!vehicle.model) {
    errors.push(`Row ${index + 1}: Model is required`);
  }
  if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
    errors.push(`Row ${index + 1}: Valid year is required`);
  }
  if (vehicle.vin && vehicle.vin.length !== 17) {
    errors.push(`Row ${index + 1}: VIN must be 17 characters`);
  }

  return errors;
}

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    let rows: any[] = [];

    // Parse file based on type
    if (fileName.endsWith('.csv')) {
      const content = Buffer.from(fileBuffer).toString('utf-8');
      rows = parseCSV(content);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    } else if (fileName.endsWith('.pdf')) {
      // For PDF files, we'll extract text and try to parse it
      // This is a simplified approach - in production, you might want more sophisticated PDF parsing
      const pdfData = await pdf(Buffer.from(fileBuffer));
      const text = pdfData.text;
      
      // Try to extract tabular data from PDF text
      // This is a basic implementation - you might need more sophisticated parsing
      const lines = text.split('\n').filter(line => line.trim());
      const dataLines = lines.filter(line => 
        line.includes(',') || line.includes('\t') || /\d{4}/.test(line)
      );
      
      if (dataLines.length > 0) {
        // Try to parse as CSV-like data
        rows = dataLines.map(line => {
          const values = line.split(/[,\t]/).map(v => v.trim());
          return {
            'VIN': values[0] || '',
            'Year': values[1] || '',
            'Make': values[2] || '',
            'Model': values[3] || '',
            'Status': values[4] || 'Pending',
            'Odometer': values[5] || '',
            'Bought Price': values[6] || '',
            'Title Status': values[7] || 'Absent',
          };
        });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // Process and validate data
    const vehicles: VehicleInsert[] = [];
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const vehicle = mapToVehicleSchema(row);
      
      // Validate vehicle data
      const validationErrors = validateVehicle(vehicle, i);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
        continue;
      }

      // Check for duplicate VIN if provided
      if (vehicle.vin) {
        const { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('id')
          .eq('vin', vehicle.vin)
          .single();

        if (existingVehicle) {
          errors.push(`Row ${i + 1}: Vehicle with VIN ${vehicle.vin} already exists`);
          continue;
        }
      }

      vehicles.push(vehicle);
    }

    // Insert valid vehicles
    let insertedVehicles: any[] = [];
    
    if (vehicles.length > 0) {
      const { data: insertedVehiclesData, error: insertError } = await supabase
        .from('vehicles')
        .insert(vehicles.map(v => ({ ...v, created_by: user.id })))
        .select();

      if (insertError) {
        console.error('Error inserting vehicles:', insertError);
        errors.push(`Database error: ${insertError.message}`);
      } else {
        imported = insertedVehiclesData?.length || 0;
        insertedVehicles = insertedVehiclesData || [];
      }
    }

    const result: ImportResult = {
      success: errors.length === 0,
      imported,
      errors,
      vehicles: insertedVehicles || []
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in import:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}




