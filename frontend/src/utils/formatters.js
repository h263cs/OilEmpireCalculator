export const formatLargeSync = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export const parseLargeNumber = (input) => {
  if (!input) return 0;
  const str = input.toString().toLowerCase().trim().replace(/,/g, '');
  
  const lastChar = str[str.length - 1];
  if (isNaN(lastChar)) {
    const numPart = parseFloat(str.slice(0, -1));
    if (isNaN(numPart)) return 0;
    
    const multipliers = {
      'k': 1e3,
      'm': 1e6,
      'b': 1e9,
      't': 1e12
    };
    
    return numPart * (multipliers[lastChar] || 1);
  }
  
  return parseFloat(str) || 0;
};