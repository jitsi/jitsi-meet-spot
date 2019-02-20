const articles = [
    'The',
    'My',
    'Our',
    'A' // Special case handling needed for proper grammar.
];
const articlesCount = articles.length;
const vowels = new Set([ 'A', 'E', 'I', 'O', 'U' ]);
const prefixes = [
    'Adhoc',
    'Brainstorming',
    'Ideation',
    'Impromptu',
    'Planning',
    'Spontaneous',
    'Unplanned'
];
const prefixCount = prefixes.length;
const suffixes = [
    'Call',
    'Conversation',
    'Dialogue',
    'Discussion',
    'Exchange',
    'Huddle',
    'Meeting',
    'Standup',
    'Talk'
];
const suffixCount = suffixes.length;

/**
 * Generates a random meeting name by picking a random value from the constants
 * above.
 *
 * @returns {string}
 */
export function getRandomMeetingName() {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixCount)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixCount)];

    let article = articles[Math.floor(Math.random() * articlesCount)];

    if (article === 'A' && vowels.has(randomPrefix.charAt(0))) {
        article = 'An';
    }

    return `${article}${randomPrefix}${randomSuffix}`;
}
