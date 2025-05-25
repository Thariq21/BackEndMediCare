export function hasEmailDomain(email, domain) {
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}
