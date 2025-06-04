
export interface EbayToken {
  id: string;
  user_id?: string | null;
  ebay_username: string; // Changed from ebay_account_id and now required
  access_token: string;
  access_token_expires?: string | null;
  refresh_token?: string | null;
  refresh_token_expires?: string | null;
  scope?: string | null;
  expires_in?: number | null;
  refresh_token_expires_in?: number | null;
  created_at: string;
  updated_at: string;
}

export type EbayTokenInsert = Omit<EbayToken, 'id' | 'created_at' | 'updated_at'>;
