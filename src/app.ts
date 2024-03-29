import * as fs from 'fs';
import markdownit from 'markdown-it';
import TurndownService from 'turndown';
const turndownSurvice = new TurndownService();
turndownSurvice.keep(['details', 'summary', 'div']);
const md = markdownit({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
});
import { fetchGitHubData } from "./fetchGitHubData";
import { fetchGistData } from './fetchGistData'
import { config } from "./config"

async function getLearningMaterialDisplay() {
    let learningMaterialDisplay = `
    <details>
        <summary>Learning Materials</summary>
        <br />
        Here are some of the learning resources I've created:
        <br />
        <br />
    `;

    if (config.learningMaterialRepos.length > 0) {
        learningMaterialDisplay += `${await fetchGitHubData(config.learningMaterialRepos)}\n`;
    }

    if (config.learningMaterialGists.length > 0) {
        learningMaterialDisplay += `${await fetchGistData(config.learningMaterialGists)}\n`;
    }

    if (config.learningMaterialRepos.length === 0 && config.learningMaterialGists.length === 0) {
        learningMaterialDisplay = '';
    } else {
        learningMaterialDisplay += `</details>\n`;
    }

    return learningMaterialDisplay;
}

async function getDevelopmentProjectDisplay() {
    return config.developmentProjectRepos.length === 0 
    ? ``
    : `
        <details>
            <summary>Projects in Development</summary>
            <br />Here are some of the projects I'm currently working on:
            <br /><br />
            ${await fetchGitHubData(config.developmentProjectRepos)}
        </details>
    `;
}

async function getReleasedProjectDisplay() {
    return config.releasedProjectRepos.length === 0 
    ? ``
    : `
        <details>
            <summary>Released Projects</summary>
            <br />Here are some of the completed projects I've released:
            <br /><br />
            ${await fetchGitHubData(config.releasedProjectRepos)}
        </details>
    `;
}

async function generateMarkdown() {
    const profileCountBadge = `<img src="https://komarev.com/ghpvc/?username=${config.githubUsername}&style=for-the-badge" alt="Profile Views Count Badge">`;

    const githubStatsCardDark = `[![GitHub-Stats-Card-Dark](https://github-readme-stats.vercel.app/api?username=${config.githubUsername}&show_icons=true&hide_border=true&include_all_commits=true&card_width=600&custom_title=GitHub%20Open%20Source%20Stats&title_color=3B7EBF&text_color=FFF&icon_color=3B7EBF&hide=contribs&show=reviews,prs_merged,prs_merged_percentage&theme=transparent#gh-dark-mode-only)](https://github.com/${config.githubUsername}/${config.githubUsername}#gh-dark-mode-only)`;
    const githubStatsCardLight = `[![GitHub-Stats-Card-Light](https://github-readme-stats.vercel.app/api?username=${config.githubUsername}&show_icons=true&hide_border=true&include_all_commits=true&card_width=600&custom_title=GitHub%20Open%20Source%20Stats&title_color=3B7EBF&text_color=474A4E&icon_color=3B7EBF&hide=contribs&show=reviews,prs_merged,prs_merged_percentage&theme=transparent#gh-light-mode-only)](https://github.com/${config.githubUsername}/${config.githubUsername}#gh-light-mode-only)`;

    const metricsBasic = `<img src="content/metrics.basic.svg" alt="Basic profile metrics"/>`;
    const metricsFollowup = `<img src="content/metrics.followup.svg" alt="Followup profile metrics"/>`;
    const metricsLanguages = `<img src="content/metrics.languages.svg" alt="Languages profile metrics"/>`;

    const developmentProjectDisplay = await getDevelopmentProjectDisplay();
    const releasedProjectDisplay = await getReleasedProjectDisplay();
    const learningMaterialDisplay = await getLearningMaterialDisplay();

    const aboutHtml = `
    <div align="center">
        ${profileCountBadge}

        <br /><br />

        Highly detail-oriented individual with a passion for software development and data science. Excels at designing creative and impactful solutions to complex challenges. Inspired by curiosity and passion for lifelong learning to continuously expand knowledge in the field of computer science.

        <br /><br />

        ${metricsBasic} ${metricsFollowup} ${metricsLanguages}
    </div>

    <br />

    <h2>Highlights</h2>

    ${developmentProjectDisplay}
    ${releasedProjectDisplay}
    ${learningMaterialDisplay}
    <details>
        <summary>Extra Info</summary>
        <ul>
            <li>⭐️ Pronouns: She/Her</li>
            <li>💬 How to reach me: Feel free to send me an email at <a href="mailto:clairechilders@oakland.edu">clairechilders@oakland.edu</a></li>
        </ul>
    </details>

    <br /><br />
    <div align="center">
        <a href="https://github.com/${config.githubUsername}/${config.githubUsername}/actions/workflows/build.yml">
            <img src="https://github.com/${config.githubUsername}/${config.githubUsername}/actions/workflows/build.yml/badge.svg">
        </a>
    </div>
    `;

    const aboutMarkdown = `${turndownSurvice.turndown(aboutHtml)}`;

    fs.writeFile('README.md', aboutMarkdown, (error: any) => {
        if (error) throw new Error(`There was an error writing to the README.md file: ${error}`);
        console.log('README.md file has been written to successfully!');
    });
}

generateMarkdown();
