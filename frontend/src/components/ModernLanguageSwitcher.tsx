import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const ModernLanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const isRTL = currentLanguage.dir === 'rtl';

  const handleLanguageChange = (languageCode: string) => {
    const selectedLang = languages.find(lang => lang.code === languageCode);
    i18n.changeLanguage(languageCode);
    
    // Update document direction
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = languageCode;
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center space-x-2 px-3 py-2 
          bg-white border border-gray-200 rounded-lg shadow-sm
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200
          ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}
        `}
        title={t('common.changeLanguage')}
      >
        {/* Language Icon */}
        <div className="relative">
          <Globe className={`h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors ${isRTL ? 'transform scale-x-[-1]' : ''}`} />
          <div className="absolute -top-1 -right-1 w-3 h-3 text-xs flex items-center justify-center">
            {currentLanguage.flag}
          </div>
        </div>
        
        {/* Language Name */}
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:block">
          {currentLanguage.nativeName}
        </span>
        
        {/* Direction Indicator */}
        <div className={`w-2 h-2 rounded-full ${isRTL ? 'bg-orange-400' : 'bg-blue-400'} transition-colors`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={`
            absolute z-20 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200
            transform transition-all duration-200 origin-top
            ${isRTL ? 'left-0' : 'right-0'}
          `}>
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                {t('common.selectLanguage')}
              </div>
              
              {languages.map((language) => {
                const isSelected = i18n.language === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-lg
                      text-left transition-all duration-150
                      ${isSelected 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${language.dir === 'rtl' ? 'flex-row-reverse' : ''}
                    `}
                  >
                    <div className={`flex items-center space-x-3 ${language.dir === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="text-lg">{language.flag}</span>
                      <div className={language.dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <div className="text-sm font-medium">{language.nativeName}</div>
                        <div className="text-xs text-gray-500">{language.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Direction Badge */}
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${language.dir === 'rtl' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                        }
                      `}>
                        {language.dir.toUpperCase()}
                      </span>
                      
                      {/* Selected Check */}
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernLanguageSwitcher;
