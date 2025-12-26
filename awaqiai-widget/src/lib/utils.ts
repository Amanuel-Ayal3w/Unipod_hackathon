import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

export function isRTLText(text: string): boolean {
  if (!text) return false;
  
  const hebrewChars = /[\u0590-\u05FF]/; // Hebrew Unicode block
  
  const arabicChars = /[\u0600-\u06FF]/; // Arabic Unicode block
  
  const firstChars = text.replace(/\s+/g, '').substring(0, 10);
  
  // if the first characters are Hebrew or Arabic, consider it RTL text
  if (hebrewChars.test(firstChars) || arabicChars.test(firstChars)) {
    return true;
  }
  
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  
  const sample = text.substring(0, Math.min(100, text.length));
  let rtlCount = 0;
  
  for (let i = 0; i < sample.length; i++) {
    if (rtlChars.test(sample[i])) {
      rtlCount++;
    }
  }

  const rtlPercentage = rtlCount / sample.length;
  
  // If more than 30% of characters are RTL, consider it RTL text
  return rtlPercentage > 0.3;
}