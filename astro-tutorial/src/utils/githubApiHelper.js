import {Octokit} from "@octokit/rest"
const authToken = import.meta.env.OSSI_SITE_TOKEN

async function getContributorStats(){
    const octokit = new Octokit({
        baseUrl:'https://api.github.com', 
        auth: authToken,
      })

    return await octokit.rest.repos.getContributorsStats({
      owner:"allison-truhlar", 
      repo:"ossi-website-framework-tests",
    })
}

export async function getMostRecentContributors(numAuthors) {
    const {data} = await getContributorStats()

    const mostRecentContributionWeekByAuthor = new Map();
    data.forEach(entry => {
        const authorInfo = {
            login: entry.author.login,
            avatar_url: entry.author.avatar_url,
            html_url: entry.author.html_url
        };

        //Iterate in reverse order because we want the most recent week with additions
        for (let i = entry.weeks.length - 1; i >= 0; i--) {
            const week = entry.weeks[i];
            const additions = week.a;

            if (additions > 0 && !mostRecentContributionWeekByAuthor.has(authorInfo.login)) {
                mostRecentContributionWeekByAuthor.set(authorInfo.login, {
                    week: week.w,
                    authorInfo
                });
            }
        }
    });

    const resultArray = Array.from(mostRecentContributionWeekByAuthor.values());

    resultArray.sort((a, b) => b.week - a.week);

    const trimmedResult = resultArray.slice(0, numAuthors);

    return trimmedResult;
}  
      