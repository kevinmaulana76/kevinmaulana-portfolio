export const ADMIN_AUTH_KEY = 'kevin_portfolio_admin_auth_v2';

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const getSocialIcon = (label: string): string => {
  const l = label ? label.toLowerCase() : '';
  if (l.includes('instagram')) return 'fa-brands fa-instagram';
  if (l.includes('behance')) return 'fa-brands fa-behance';
  if (l.includes('dribbble')) return 'fa-brands fa-dribbble';
  if (l.includes('twitter') || l.includes(' x ')) return 'fa-brands fa-x-twitter';
  if (l.includes('facebook')) return 'fa-brands fa-facebook';
  if (l.includes('linkedin')) return 'fa-brands fa-linkedin';
  if (l.includes('youtube')) return 'fa-brands fa-youtube';
  if (l.includes('tiktok')) return 'fa-brands fa-tiktok';
  if (l.includes('github')) return 'fa-brands fa-github';
  return 'fa-solid fa-link';
};

export const compressImage = (file: File, maxWidth: number = 1000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};