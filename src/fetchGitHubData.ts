import utils from "./utils";

export async function fetchGitHubData(repos: Array<string>): Promise<string> {
  const list = await Promise.all(
    repos.map(async (repo) => {
      const response = await fetch(`https://api.github.com/repos/${repo}`);
      if (!response.ok) {
        throw new Error(`"${repo}" not found. Review your list of repositories.`);
      }
      const data = await response.json();

      const releases_response = await fetch(`https://api.github.com/repos/${repo}/releases`);
      if (!response.ok) {
        throw new Error(`"${repo}/releases" not found. Review your list of repositories.`);
      }
      const releases_data = await releases_response.json();
      const release_summary = getReleaseSummary(releases_data);

      const {
        html_url: url,
        full_name: name,
        description: desc,
        pushed_at: pushed_at,
        language: lang,
        open_issues_count: issues,
      } = data;

      const last_updated = utils.formatDate(pushed_at);
      
      const summary = `
        <li>
            <a href=${url} target="_blank" rel="noopener noreferrer">${name}</a>${desc === null ? "" : ": " + desc}
            <ul>
              <li>
                📄 Language: <b>${lang}</b>
              </li>
              <li>
                🗃️ Open Issues: <b>${issues}</b>
              </li>
              <li>
                📅 Last updated: <b>${last_updated}</b>
              </li>
              ${release_summary}
            </ul>
        </li>
      `;

      return summary;
    })
  );

  return `<ul>${list.join("")}\n</ul>`;
}


function getReleaseSummary(releases_data: any[]) {
  if (releases_data.length === 0) {
    return "";
  }

  // find first release that isn't a draft or prerelease
  const full_releases = releases_data.filter((release: any) => {
    return !release.draft && !release.prerelease;
  });
  const pre_releases = releases_data.filter((release: any) => {
    return release.prerelease;
  });

  if (full_releases.length === 0 && pre_releases.length === 0) {
    return "";
  }

  // if there are no full releases, use the first prerelease
  const is_pre_release = full_releases.length === 0;
  const release = is_pre_release ? pre_releases[0] : full_releases[0];

  const {
    html_url: releases_url,
    name: releases_name,
    published_at: releases_published
  } = release;

  const release_date_str = utils.formatDate(releases_published);
  
  return `
    <li>
        🏷️ Current Release${is_pre_release ? ' (pre-release)' : ''}: 
        <a href=${releases_url} target="_blank" rel="noopener noreferrer">${releases_name}</a> 
        (Published: <b>${release_date_str}</b>)
    </li>
  `;
}