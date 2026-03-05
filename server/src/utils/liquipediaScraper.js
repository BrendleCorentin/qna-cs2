import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

/**
 * Fetches the raw HTML of a Liquipedia page using the MediaWiki API.
 * @param {string} pageName - The title of the page (e.g., 'Team_Vitality')
 * @returns {Promise<CheerioAPI|null>} - Cheerio loaded instance or null
 */
async function fetchPage(pageName) {
    const url = `https://liquipedia.net/counterstrike/api.php?action=parse&page=${pageName}&format=json`;
    console.log(`[Liquipedia] Fetching ${pageName}...`);
    try {
        const userAgent = new UserAgent().toString();
        const { data } = await axios.get(url, {
            headers: { 
                'User-Agent': userAgent, 
                'Accept-Encoding': 'gzip' 
            }
        });
        
        if (data.error) {
            console.error(`[Liquipedia] API Error for ${pageName}:`, data.error.info);
            return null;
        }
        
        const html = data.parse.text['*'];
        return cheerio.load(html);
    } catch (e) {
        console.error(`[Liquipedia] Failed to fetch ${pageName}: ${e.message}`);
        return null;
    }
}

/**
 * Scrapes the active roster from a team page.
 * @param {string} teamName - The team name as it appears in the URL (e.g. 'Team_Vitality')
 * @returns {Promise<Array>} - Array of player objects
 */
export async function getTeamRoster(teamName) {
    const $ = await fetchPage(teamName);
    if (!$) return [];

    // Find "Active" header under "Player Roster"
    let activeHeader = null;
    $('h3, h4').each((i, el) => {
        const text = $(el).text().trim();
        if (text === 'Active' || text.includes('Active Squad')) {
            activeHeader = $(el); 
            return false;
        }
    });

    if (!activeHeader) {
        console.warn(`[Liquipedia] No "Active" header found for ${teamName}`);
        return [];
    }

    // Traverse siblings to find the table
    // The header is often wrapped in a div.mw-heading, so checks parent next sibling too
    let curr = activeHeader.next();
    if (!curr.length) {
        curr = activeHeader.parent().next();
    }

    let rosterTable = null;

    for (let i = 0; i < 10; i++) {
        if (!curr.length) break;
        
        // Direct table
        if (curr.is('table')) {
            rosterTable = curr;
            break;
        }
        
        // Nested table
        const innerTable = curr.find('table.wikitable, table.roster-card').first();
        if (innerTable.length > 0) {
            rosterTable = innerTable;
            break;
        }
        const anyTable = curr.find('table').first();
        if (anyTable.length > 0) {
            rosterTable = anyTable;
            break;
        }

        curr = curr.next();
    }

    if (!rosterTable) {
        console.warn(`[Liquipedia] No lineup table found for ${teamName}`);
        return [];
    }

    const roster = [];
    rosterTable.find('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length < 2) return;

        // ID & Country
        const idCell = $(cells[0]);
        
        // Country extraction
        let country = null;
        const flagSpan = idCell.find('.flag');
        if (flagSpan.length) {
            country = flagSpan.find('a').attr('title') || flagSpan.find('img').attr('alt');
        } else {
            country = idCell.find('img.flag').attr('alt') || idCell.find('img.flag').attr('title');
        }

        // ID extraction
        // Filter out flag links
        const idLink = idCell.find('a').filter((j, el) => {
             return !$(el).parent().hasClass('flag') && !$(el).find('img').length;
        }).last(); 
        
        const id = idLink.text().trim();
        const playerLink = idLink.attr('href');

        // Name extraction
        const nameCell = $(cells[1]);
        let name = nameCell.text().replace(/\[.*?\]/g, '').trim();

        // Role extraction
        let role = 'Player';
        // Check column 3
        if (cells.length > 2) {
            const roleText = $(cells[2]).text().trim();
            if (roleText.toLowerCase().includes('coach')) role = 'Coach';
        }
        // Heuristic fallback
        if (['zonic', 'xtqzzz', 'kuben', 'b1ad3', 'saw', 'sycrone'].includes(id.toLowerCase())) role = 'Coach';

        if (id) {
            roster.push({
                ign: id,       // In-Game Name
                realName: name,
                country: country || 'Unknown',
                team: teamName.replace(/_/g, ' '),
                role: role,
                wikiLink: playerLink ? `https://liquipedia.net${playerLink}` : null
            });
        }
    });

    return roster;
}

// Hardcoded top teams list to iterate over
export const TOP_TEAMS = [
    'Team_Vitality', 'Natus_Vincere', 'G2_Esports', 'FaZe_Clan', 
    'MOUZ', 'Team_Spirit', 'Virtus.pro', 'Astralis', 
    'Team_Liquid', 'Cloud9', 'Complexity_Gaming', 'FURIA_Esports',
    'Heroic', 'ENCE', 'Team_Falcons', 'Monte', 'Eternal_Fire',
    'BIG', 'Ninjas_in_Pyjamas', 'Fnatic', 'The_MongolZ', 'M80',
    'GamerLegion', 'Apeks', 'Imperial_Esports'
];
