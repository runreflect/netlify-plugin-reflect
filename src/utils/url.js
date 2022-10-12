export function parseHostname(url) {
  return new URL(url).hostname;
}
