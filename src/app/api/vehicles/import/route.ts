import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { VehicleInsert, ImportResult } from '@/types/vehicle';
import * as XLSX from 'xlsx';
const pdf = require('pdf-parse');

// Configure runtime for file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function mmddyyyyToISO(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const [month, day, year] = dateStr.split(/[\/\-]/); // handles MM/DD/YYYY or MM-DD-YYYY
  if (!month || !day || !year) return undefined;
  // pad month and day if necessary
  const iso = `${year.trim()}-${month.trim().padStart(2,'0')}-${day.trim().padStart(2,'0')}`;
  return iso;
}

function mapToVehicleSchema(row: any): VehicleInsert {
  // Combine dealshield status and arbitration status
  let dealshield = row['Dealshield status'] || '';
  let arb = row['Arbitration status'] || '';
  const dealshield_arbitration_status = [dealshield, arb].filter(Boolean).join(' / ') || undefined;

  return {
    vin: row['Vin'] || undefined,
    year: parseInt(row['Year'] || '0') || undefined,
    make: row['Make'] || undefined,
    model: row['Model'] || undefined,
    trim: row['Trim'] || undefined,
    exterior_color: row['Exterior color'] || undefined,
    interior_color: row['Interior color'] || undefined,
    status: row['Title status'] || 'Pending',
    odometer: parseInt(row['Odometer'] || '0') || undefined,
    title_status: row['Title status'] || undefined,
    psi_status: row['PSI status'] || 'Not Eligible',
    dealshield_arbitration_status,
    bought_price: parseFloat(row['Sale price'] || '0') || undefined,
    buy_fee: parseFloat(row['Buy fee'] || '0') || undefined,
    sale_invoice: parseFloat(row['Sale invoice balance'] || '0') || undefined,
    other_charges: parseFloat(row['Other charges'] || '0') || undefined,
    other_charges2: parseFloat(row['Other charges2 balance'] || '0') || undefined,
    total_vehicle_cost: parseFloat(row['Total vehicle balance'] || '0') || undefined,
    sale_date: mmddyyyyToISO(row['Sale date']),
    lane: parseInt(row['Lane'] || '0') || undefined,
    run: parseInt(row['Run'] || '0') || undefined,
    channel: row['Channel'] || undefined,
    facilitating_location: row['Facilitating location'] || undefined,
    vehicle_location: row['Vehicle location'] || undefined,
    pickup_location_address1: row['Pickup location address1'] || undefined,
    pickup_location_address2: row['Pickup location address2'] || undefined,
    pickup_location_city: row['Pickup location city'] || undefined,
    pickup_location_state: row['Pickup location2 state'] || undefined,
    pickup_location_zip: row['zip code'] || undefined,
    pickup_location_phone: row['Pickup location Phone Number'] || undefined,
    seller_name: row['Seller name'] || undefined,
    buyer_dealership: row['Buyer dealership'] || undefined,
    buyer_contact_name: row['Buyer contact name'] || undefined,
    buyer_aa_id: row['Buyer AA ID#'] || undefined,
    buyer_rep_aa_id: row['Buyer Rep AA ID#'] || undefined,
    sale_invoice_status: row['Sale invoice status'] || undefined,
    sale_invoice_paid_date: mmddyyyyToISO(row['Sale invoice paid date']),
    // Odometer Unit is ignored per spec
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
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['Unauthorized'],
        vehicles: []
      }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['Forbidden - Admin access required'],
        vehicles: []
      }, { status: 403 });
    }

    // Ensure we can read FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Error parsing FormData:', error);
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['Failed to parse file upload'],
        vehicles: []
      }, { status: 400 });
    }

    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['No file provided or invalid file'],
        vehicles: []
      }, { status: 400 });
    }

    let fileBuffer: ArrayBuffer;
    try {
      fileBuffer = await file.arrayBuffer();
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['Failed to read file'],
        vehicles: []
      }, { status: 400 });
    }
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
            'Vin': values[0] || '',
            'Year': values[1] || '',
            'Make': values[2] || '',
            'Model': values[3] || '',
            'Title status': values[4] || 'Pending',
            'Odometer': values[5] || '',
            'Sale price': values[6] || '',
            'Dealshield status': values[7] || '',
            'Arbitration status': values[8] || '',
          };
        });
      }
    } else {
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['Unsupported file type'],
        vehicles: []
      }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false,
        imported: 0,
        errors: ['No data found in file'],
        vehicles: []
      }, { status: 400 });
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return properly formatted JSON response
    return NextResponse.json({ 
      success: false,
      imported: 0,
      errors: [`Import failed: ${errorMessage}`],
      vehicles: []
    }, { status: 500 });
  }
}




