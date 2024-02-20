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
  
        const {
          html_url: url,
          full_name: name,
          description: desc,
          pushed_at: last_updated,
          language: lang,
          open_issues_count: issues,
        } = data;

        const last_updated_str = utils.formatDate(last_updated);

        let summary = `
          <li>
              <a href=${url} target="_blank" rel="noopener noreferrer">${name}</a> 
              (📄 Language: <b>${lang}</b> | 🗃️ Issues: <b>${issues}</b> | 📅 Last updated: <b>${last_updated_str}</b>)
              ${desc === null ? "" : ": " + desc}
          </li>
        `;
        if (releases_data.length === 0) {
          return summary;
        }

        // find first release that isn't a draft or prerelease
        const full_releases = releases_data.filter((release: any) => {
          return !release.draft && !release.prerelease;
        });
        const pre_releases = releases_data.filter((release: any) => {
          return release.prerelease;
        });

        if (full_releases.length === 0 && pre_releases.length === 0) {
          return summary;
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
        
        summary += `
        <ul>
            <li>
                🏷️ Current Release${is_pre_release ? ' (pre-release)' : ''}: 
                <a href=${releases_url} target="_blank" rel="noopener noreferrer">${releases_name}</a> 
                (Published: <b>${release_date_str}</b>)
            </li>
        </ul>
        `;
  
        return summary;
      })
    );
  
    return `<ul>${list.join("")}\n</ul>`;
  }
