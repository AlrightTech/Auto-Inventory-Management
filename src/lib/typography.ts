import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Typography utility functions with Electric Blue Dark Theme support
export const typography = {
  // Dashboard headings → text-[#111827] dark:text-[#FAFAFA] font-semibold
  heading: (className?: string) => cn("text-[#111827] dark:text-[#FAFAFA] font-semibold", className),
  
  // Subtitles / small labels → text-[#4B5563] dark:text-[#BFBFBF]
  subtitle: (className?: string) => cn("text-[#4B5563] dark:text-[#BFBFBF]", className),
  
  // Card and metric values → text-[#000000] dark:text-[#FAFAFA]
  cardValue: (className?: string) => cn("text-[#000000] dark:text-[#FAFAFA]", className),
  
  // Links / accents → text-[#1E3A8A] dark:text-[#00BFFF] hover:text-[#0D9488] dark:hover:text-[#00E5FF]
  link: (className?: string) => cn("text-[#1E3A8A] dark:text-[#00BFFF] hover:text-[#0D9488] dark:hover:text-[#00E5FF] transition-colors duration-200 cursor-pointer", className),
  
  // Link accent without cursor pointer
  linkAccent: (className?: string) => cn("text-[#1E3A8A] dark:text-[#00BFFF] hover:text-[#0D9488] dark:hover:text-[#00E5FF] transition-colors duration-200", className),
  
  // Additional utility classes with Electric Blue Dark Theme
  muted: (className?: string) => cn("text-[#4B5563] dark:text-[#BFBFBF]", className),
  body: (className?: string) => cn("text-[#000000] dark:text-[#FAFAFA]", className),
} as const;

// Predefined typography combinations
export const textStyles = {
  h1: typography.heading("text-3xl"),
  h2: typography.heading("text-2xl"),
  h3: typography.heading("text-xl"),
  h4: typography.heading("text-lg"),
  h5: typography.heading("text-base"),
  h6: typography.heading("text-sm"),
  
  subtitle: typography.subtitle("text-sm"),
  subtitleLarge: typography.subtitle("text-base"),
  
  cardValue: typography.cardValue("text-lg font-medium"),
  cardValueSmall: typography.cardValue("text-sm"),
  
  link: typography.link(),
  linkSmall: typography.link("text-sm"),
  linkLarge: typography.link("text-lg"),
  
  muted: typography.muted("text-sm"),
  mutedLarge: typography.muted("text-base"),
  
  body: typography.body(),
  bodySmall: typography.body("text-sm"),
  bodyLarge: typography.body("text-lg"),
} as const;
