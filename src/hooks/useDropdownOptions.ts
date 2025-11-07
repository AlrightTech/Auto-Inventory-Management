import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DropdownOption {
  label: string;
  value: string;
}

export function useDropdownOptions(category: string, activeOnly: boolean = true) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = `/api/dropdown-settings?category=${category}&active_only=${activeOnly}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch dropdown options');
        }

        const { data } = await response.json();
        
        // Transform data to { label, value } format
        const transformedOptions = (data || []).map((item: any) => ({
          label: item.label,
          value: item.value,
        }));

        setOptions(transformedOptions);
      } catch (err: any) {
        console.error('Error fetching dropdown options:', err);
        setError(err.message || 'Failed to load dropdown options');
        toast.error('Failed to load dropdown options. Please try again.');
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchOptions();
    }
  }, [category, activeOnly]);

  return { options, isLoading, error };
}

