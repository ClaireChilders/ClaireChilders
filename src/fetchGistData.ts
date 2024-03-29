import utils from "./utils";

export async function fetchGistData(gists: Array<string>): Promise<string> {
    const list = await Promise.all(
        gists.map(async (gist) => {
            const response = await fetch(`https://api.github.com/gists/${gist}`);
            if (!response.ok) {
                throw new Error(`"${gist}" not found. Review your list of gists.`);
            }
            const data = await response.json();
            
            const {
                html_url: url,
                description: name,
                created_at: created_at,
                updated_at: last_updated,
                files: files
            } = data;

            const date_created = utils.formatDate(created_at);
            const date_updated = utils.formatDate(last_updated);

            // Use the first line (excluding the title/header) of the first file as the description for the gist
            const description = files[Object.keys(files)[0]].content.split('\n')[2];

            // Calculate the total size of the gist and the most used language
            let size = 0;
            let language_frequency: { [key: string]: number } = {};
            for (const file in files) {
                size += files[file].size;
                const language = files[file].language;
                if (!language_frequency[language]) {
                    language_frequency[language] = files[file].size;
                } else {
                    language_frequency[language]+=files[file].size;
                }
            }
            let lang = Object.keys(language_frequency).reduce((a, b) => language_frequency[a] > language_frequency[b] ? a : b);

            
            const summary = `
                <li>
                    <a href=${url} target="_blank" rel="noopener noreferrer">${name}</a>: ${description}
                    <ul>
                        <li>📄 Language: <b>${lang}</b></li>
                        <li>🎨 Created: <b>${date_created}</b></li>
                        <li>📅 Last updated: <b>${date_updated}</b></li>
                        <li>📏 Size: <b>${size} characters</b></li>
                    </ul>
                </li>
            `;
    
            return summary;
        })
    );
  
    return `<ul>${list.join("")}\n</ul>`;
  }
