
export const getSocialIcon = (label: string) => {
  const l = label.toLowerCase();
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
