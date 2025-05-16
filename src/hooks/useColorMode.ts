import { useState, useEffect } from 'react';

type ColorMode = 'light' | 'dark';

const useColorMode = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  useEffect(() => {
    // Check if user has a preferred color scheme
    const userPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // Check if there's a saved preference in localStorage
    const savedMode = localStorage.getItem('colorMode') as ColorMode;
    
    if (savedMode) {
      setColorMode(savedMode);
      document.documentElement.classList.toggle('dark', savedMode === 'dark');
    } else {
      setColorMode(userPreference);
      document.documentElement.classList.toggle('dark', userPreference === 'dark');
    }
  }, []);

  const updateColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem('colorMode', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };

  return [colorMode, updateColorMode] as const;
};

export default useColorMode;