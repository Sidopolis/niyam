import { searchRules } from '../composer.js';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const CATEGORY_COLORS = {
  stacks: colors.cyan,
  roles: colors.magenta,
  principles: colors.yellow,
  workflows: colors.green,
};

export async function run(args) {
  const query = args.join(' ');

  if (!query) {
    console.log(`\n${colors.red}  ✖ Error:${colors.reset} No search query provided.`);
    console.log(`\n  ${colors.bold}Usage:${colors.reset} niyam search <query>\n`);
    console.log(`  ${colors.bold}Examples:${colors.reset}`);
    console.log(`    ${colors.dim}$ niyam search testing${colors.reset}`);
    console.log(`    ${colors.dim}$ niyam search "error handling"${colors.reset}`);
    console.log(`    ${colors.dim}$ niyam search react hooks${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}  ▸ Searching for "${query}"...${colors.reset}\n`);

  const results = searchRules(query);

  if (results.length === 0) {
    console.log(`  ${colors.yellow}No results found for "${query}".${colors.reset}`);
    console.log(`  ${colors.dim}Try a different keyword or run ${colors.cyan}niyam list${colors.dim} to see all rules.${colors.reset}\n`);
    return;
  }

  console.log(`  ${colors.green}Found ${results.length} matching rule${results.length > 1 ? 's' : ''}:${colors.reset}\n`);

  for (const result of results) {
    const catColor = CATEGORY_COLORS[result.category] || colors.cyan;
    console.log(`  ${catColor}${colors.bold}${result.name}${colors.reset} ${colors.dim}(${result.category}/${result.id})${colors.reset}`);
    console.log(`  ${colors.dim}${result.description}${colors.reset}`);

    for (const match of result.matches.slice(0, 3)) {
      // Highlight the query in match text
      const highlighted = match.replace(
        new RegExp(`(${escapeRegex(query)})`, 'gi'),
        `${colors.yellow}${colors.bold}$1${colors.reset}${colors.dim}`
      );
      console.log(`    ${colors.dim}${highlighted}${colors.reset}`);
    }
    console.log('');
  }

  console.log(`  ${colors.dim}Add a rule: niyam add <category/id>${colors.reset}\n`);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
