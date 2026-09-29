const fetch = require('node-fetch');
const Parser = require('rss-parser');
const parser = new Parser();

// Negative keywords to filter out
const NEGATIVE_KEYWORDS = [
    'lawsuit', 'sued', 'sues', 'scandal', 'controversy', 'controversial',
    'layoff', 'layoffs', 'fire', 'fired', 'fires', 'firing',
    'investigation', 'investigated', 'fraud', 'fraudulent',
    'failure', 'failed', 'fails', 'failing',
    'loses', 'loss', 'lost', 'decline', 'declining', 'declined',
    'drop', 'drops', 'dropped', 'plunge', 'plunged',
    'crisis', 'criticism', 'criticized', 'criticizes', 'critique',
    'fined', 'fine', 'penalty', 'penalties',
    'breach', 'breached', 'hack', 'hacked', 'hacker', 'data breach',
    'complaint', 'complaints', 'accuse', 'accused', 'accuses',
    'misconduct', 'settles', 'settlement', 'resign', 'resigned',
    'terminated', 'termination', 'downsizing', 'cutback', 'cuts',
    'scandal', 'scam', 'illegal', 'violation', 'violated',
    'defeat', 'problem', 'trouble', 'disaster', 'collapse'
];

// Optional: Positive keywords (for reference, not strictly filtering)
const POSITIVE_KEYWORDS = [
    'award', 'awards', 'awarded', 'win', 'wins', 'won', 'winner',
    'partner', 'partnership', 'collaboration', 'collaborate',
    'innovation', 'innovative', 'innovate',
    'launch', 'launches', 'launched', 'unveil', 'unveils',
    'expansion', 'expand', 'expands', 'grow', 'growth', 'growing',
    'success', 'successful', 'achievement',
    'contract', 'contracts', 'deal', 'agreement',
    'leader', 'leading', 'recognized', 'recognition',
    'excellence', 'outstanding', 'breakthrough',
    'accelerate', 'boost', 'enhance', 'improve', 'milestone'
];

function isPositiveHeadline(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();

    // Check if any negative keyword is present
    const hasNegative = NEGATIVE_KEYWORDS.some(keyword => text.includes(keyword));

    // Filter out negative articles
    if (hasNegative) {
        console.log(`Filtered out negative article: ${title}`);
        return false;
    }

    return true;
}

function categorizeFederalServices(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    const isFederal = text.includes('federal') ||
                      text.includes('government') ||
                      text.includes('accenture federal services');

    return isFederal;
}

async function fetchGoogleNews(query) {
    try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const feed = await parser.parseURL(rssUrl);

        return feed.items.map(item => ({
            title: item.title.replace(/ - [^-]+$/, ''), // Remove source suffix
            description: item.contentSnippet || item.content || '',
            url: item.link,
            source: 'Google News',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            isFederal: categorizeFederalServices(item.title, item.contentSnippet || ''),
            categories: []
        }));
    } catch (error) {
        console.error('Error fetching Google News:', error);
        return [];
    }
}

exports.handler = async (event, context) => {
    try {
        console.log('Fetching Accenture news...');

        // Fetch news from multiple queries
        const queries = [
            'Accenture',
            'Accenture Federal Services',
            'Accenture contract',
            'Accenture partnership',
            'Accenture innovation'
        ];

        let allArticles = [];
        let successfulFeeds = 0;

        // Fetch from all queries in parallel
        const results = await Promise.all(
            queries.map(query => fetchGoogleNews(query))
        );

        results.forEach(articles => {
            if (articles.length > 0) {
                successfulFeeds++;
                allArticles = allArticles.concat(articles);
            }
        });

        // Remove duplicates based on title
        const uniqueArticles = [];
        const seenTitles = new Set();

        for (const article of allArticles) {
            if (!seenTitles.has(article.title)) {
                seenTitles.add(article.title);
                uniqueArticles.push(article);
            }
        }

        console.log(`Found ${uniqueArticles.length} unique articles before filtering`);

        // Filter for positive headlines only
        const positiveArticles = uniqueArticles.filter(article =>
            isPositiveHeadline(article.title, article.description)
        );

        console.log(`${positiveArticles.length} positive articles after filtering`);

        // Sort by date (newest first)
        positiveArticles.sort((a, b) =>
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );

        // Limit to top 20 articles
        const topArticles = positiveArticles.slice(0, 20);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                articles: topArticles,
                meta: {
                    timestamp: Date.now(),
                    totalArticles: uniqueArticles.length,
                    accentureArticles: positiveArticles.length,
                    successfulFeeds: successfulFeeds,
                    filteredOut: uniqueArticles.length - positiveArticles.length
                }
            })
        };

    } catch (error) {
        console.error('Error in serverless function:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.message,
                articles: [],
                meta: {
                    timestamp: Date.now(),
                    totalArticles: 0,
                    accentureArticles: 0,
                    successfulFeeds: 0
                }
            })
        };
    }
};
