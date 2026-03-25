/** Joint des classes CSS en ignorant les valeurs falsy. */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
