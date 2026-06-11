import { useState, useEffect } from 'react';
import { subscribeTheme, getThemeColors, getIsDark } from '../store/themeStore';

export default function useTheme() {
  const [colors, setColors] = useState(getThemeColors());
  useEffect(() => {
    const unsub = subscribeTheme(() => setColors(getThemeColors()));
    return unsub;
  }, []);
  return colors;
}

export function useIsDark() {
  const [dark, setDark] = useState(getIsDark());
  useEffect(() => {
    const unsub = subscribeTheme(d => setDark(d));
    return unsub;
  }, []);
  return dark;
}
