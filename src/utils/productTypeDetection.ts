
import { useEanMapping } from '@/hooks/useEanMapping';

export interface ProductTypeResult {
  productType: 'static' | 'personalized' | 'unknown';
  requiresPersonalization: boolean;
  canDirectToQueue: boolean;
}

export const useProductTypeDetection = () => {
  const { getProductTypeByEan } = useEanMapping();

  const detectProductType = async (eanNumber: string): Promise<ProductTypeResult> => {
    try {
      const productType = await getProductTypeByEan(eanNumber);
      
      if (!productType) {
        return {
          productType: 'unknown',
          requiresPersonalization: false,
          canDirectToQueue: false
        };
      }

      return {
        productType,
        requiresPersonalization: productType === 'personalized',
        canDirectToQueue: productType === 'static'
      };
    } catch (error) {
      console.error('Error detecting product type:', error);
      return {
        productType: 'unknown',
        requiresPersonalization: false,
        canDirectToQueue: false
      };
    }
  };

  const processOrderByEan = async (eanNumber: string, orderData: any) => {
    const result = await detectProductType(eanNumber);
    
    console.log(`Product type detected for EAN ${eanNumber}:`, result);
    
    if (result.canDirectToQueue) {
      console.log('Static product detected - can go directly to job queue');
      // TODO: Add logic to send directly to job queue
      return { action: 'queue', result };
    } else if (result.requiresPersonalization) {
      console.log('Personalized product detected - requires personalization step');
      // TODO: Add logic to show personalization interface
      return { action: 'personalize', result };
    } else {
      console.log('Unknown product type - manual intervention required');
      return { action: 'manual', result };
    }
  };

  return {
    detectProductType,
    processOrderByEan
  };
};
