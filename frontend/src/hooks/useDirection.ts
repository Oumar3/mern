import { useTranslation } from 'react-i18next';

export const useDirection = () => {
  const { i18n } = useTranslation();
  
  const isRTL = i18n.language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  
  // Utility functions for RTL-aware styling
  const getTextAlign = (defaultAlign: 'left' | 'right' | 'center' = 'left') => {
    if (defaultAlign === 'center') return 'center';
    if (isRTL) {
      return defaultAlign === 'left' ? 'right' : 'left';
    }
    return defaultAlign;
  };
  
  const getMarginClass = (side: 'left' | 'right', size: string) => {
    const actualSide = isRTL ? (side === 'left' ? 'right' : 'left') : side;
    return `m${actualSide[0]}-${size}`;
  };
  
  const getPaddingClass = (side: 'left' | 'right', size: string) => {
    const actualSide = isRTL ? (side === 'left' ? 'right' : 'left') : side;
    return `p${actualSide[0]}-${size}`;
  };
  
  return {
    isRTL,
    direction,
    getTextAlign,
    getMarginClass,
    getPaddingClass
  };
};
