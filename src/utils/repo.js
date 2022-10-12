export function parseRepositoryURL(url) {
  if (url?.startsWith("git@github.com")) {
    const match = url.match(/git@github\.com:([^/]+)\/(.*)/);

    return {
      organization: match[1],
      repository: match[2],
    };
  } else if (url?.startsWith("https://github.com/")) {
    const match = url.match(/https:\/\/github\.com\/([^/]+)\/([^.]+).git/);

    return {
      organization: match[1],
      repository: match[2],
    };
  }

  return {
    organization: undefined,
    repository: undefined,
  };
}
