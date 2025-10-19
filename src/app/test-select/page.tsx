'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestSelectPage() {
  const testItems = [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Select Component Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-white mb-2 block">Test Select</label>
            <Select>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {testItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white mb-2 block">Empty Value Test</label>
            <Select>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Items</SelectItem>
                {testItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
