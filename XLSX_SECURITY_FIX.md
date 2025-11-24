# XLSX Security Vulnerability Fix

## Issue
The `xlsx` package (version 0.18.5) has high severity vulnerabilities:
- Prototype Pollution vulnerabilities (GHSA-4r6h-8v6p-xvw6)
- Regular Expression Denial of Service (ReDoS) vulnerabilities (GHSA-5pgg-2g8v-p4x9)

npm audit reports: **"No fix available"** for the current version.

## Current Usage
The `xlsx` package is used in 3 locations:
1. `src/app/api/vehicles/import/route.ts` - Reading Excel files for import
2. `src/app/admin/inventory/page.tsx` - Exporting inventory to Excel
3. `src/app/admin/inventory/buyer-withdrew/page.tsx` - Exporting buyer-withdrew vehicles to Excel

## Solutions

### Option 1: Update to Latest Version (Recommended First Step)
Try updating to the latest version which may have security patches:

```bash
npm install xlsx@latest
npm audit
```

If vulnerabilities persist, proceed to Option 2.

### Option 2: Switch to ExcelJS (Recommended Long-term Solution)
`exceljs` is a more modern, actively maintained library with better security:

**Installation:**
```bash
npm uninstall xlsx
npm install exceljs
npm install --save-dev @types/exceljs
```

**Migration Steps:**

1. **Update import route** (`src/app/api/vehicles/import/route.ts`):
```typescript
// Replace: import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

// Replace the Excel reading code:
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(fileBuffer);
const worksheet = workbook.worksheets[0];
const rows = worksheet.getSheetValues().slice(1).map(row => {
  // Convert row array to object based on headers
  // Implementation depends on your data structure
});
```

2. **Update export functions** (`src/app/admin/inventory/page.tsx` and `buyer-withdrew/page.tsx`):
```typescript
// Replace: import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

// Replace export code:
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Inventory');
worksheet.addRows(wsData);
const buffer = await workbook.xlsx.writeBuffer();
// Use buffer to create download
```

### Option 3: Add Input Validation (Temporary Mitigation)
If you must keep xlsx temporarily, add strict input validation:

1. Validate file size limits
2. Sanitize file names
3. Use sandboxed execution if possible
4. Add rate limiting for file uploads

## Recommended Action Plan

1. **Immediate**: Try updating xlsx to latest version
   ```bash
   npm install xlsx@latest
   npm audit
   ```

2. **If vulnerabilities persist**: Switch to ExcelJS (Option 2)
   - This is the most secure long-term solution
   - ExcelJS is actively maintained and has better TypeScript support

3. **If switching libraries**: Test all import/export functionality thoroughly

## Testing After Fix

After implementing the fix, test:
- [ ] Vehicle import from Excel files (.xlsx, .xls)
- [ ] Inventory export to Excel
- [ ] Buyer-withdrew export to Excel
- [ ] File size limits and error handling
- [ ] Various Excel file formats and edge cases

## Notes

- The vulnerabilities are in the xlsx parsing/reading functionality
- Risk is higher if processing untrusted user-uploaded files
- Consider implementing file validation and size limits regardless of library choice

