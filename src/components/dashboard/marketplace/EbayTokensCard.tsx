
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Clock, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EbayToken } from '@/types/ebayTypes';

interface EbayTokensCardProps {
  tokens: EbayToken[];
  loading: boolean;
  onDeleteToken: (tokenId: string) => void;
  onRefreshTokens: () => void;
}

const EbayTokensCard: React.FC<EbayTokensCardProps> = ({
  tokens,
  loading,
  onDeleteToken,
  onRefreshTokens
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString('de-DE');
  };

  const isTokenExpired = (token: EbayToken) => {
    if (!token.access_token_expires) return false;
    return new Date(token.access_token_expires) < new Date();
  };

  const getTokenStatus = (token: EbayToken) => {
    if (isTokenExpired(token)) {
      return { status: 'expired', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <div>
              <CardTitle>eBay OAuth Tokens</CardTitle>
              <CardDescription>Manage your eBay authentication tokens</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefreshTokens}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="text-4xl mb-4 block">🔐</span>
            <p>No eBay tokens found</p>
            <p className="text-sm">eBay tokens will appear here after OAuth authentication</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>eBay Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  const { status, color } = getTokenStatus(token);
                  return (
                    <TableRow key={token.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{token.ebay_username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={color}>
                          {status === 'expired' ? 'Expired' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="h-3 w-3" />
                          {formatDate(token.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {formatDate(token.access_token_expires)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-500 max-w-32 truncate">
                          {token.scope || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onDeleteToken(token.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EbayTokensCard;
