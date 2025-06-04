
import type { EbayToken } from '@/types/ebayTypes';

export const getValidToken = (tokens: EbayToken[], ebayUsername?: string | null): EbayToken | null => {
  const token = tokens.find(t => 
    ebayUsername ? t.ebay_username === ebayUsername : t.ebay_username
  ) || tokens[0]; // Fallback to first token if no specific username match
  
  if (!token) return null;

  // Check if token is still valid
  if (token.expires_in && token.updated_at) {
    const tokenAge = Date.now() - new Date(token.updated_at).getTime();
    const tokenAgeInSeconds = Math.floor(tokenAge / 1000);
    
    // Return token if it's still valid (with 5 minute buffer)
    if (tokenAgeInSeconds < (token.expires_in - 300)) {
      return token;
    }
  }
  
  // Fallback to timestamp-based check if available
  if (token.access_token_expires) {
    const now = new Date();
    const expiresAt = new Date(token.access_token_expires);
    
    if (expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
      return token;
    }
  }
  
  return null;
};

export const isTokenExpiringSoon = (token: EbayToken, minutesBuffer = 30): boolean => {
  // Check using expires_in if available
  if (token.expires_in && token.updated_at) {
    const tokenAge = Date.now() - new Date(token.updated_at).getTime();
    const tokenAgeInSeconds = Math.floor(tokenAge / 1000);
    return tokenAgeInSeconds >= (token.expires_in - minutesBuffer * 60);
  }
  
  // Fallback to timestamp-based check
  if (token.access_token_expires) {
    const now = new Date();
    const expiresAt = new Date(token.access_token_expires);
    return expiresAt.getTime() <= now.getTime() + minutesBuffer * 60 * 1000;
  }
  
  return false;
};
