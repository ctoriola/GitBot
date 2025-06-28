const jsonfile = require("jsonfile");
const moment = require("moment");
const simpleGit = require("simple-git");
const random = require("random");
const fs = require("fs");
const path = require("path");

// Initialize simple-git with your repo path
const git = simpleGit(process.cwd()); // Uses current directory

const FILE_PATHS = [
  "src/main.js",
  "src/utils.js",
  "docs/README.md",
  "tests/test.js",
  "config.json"
];

const generateRandomCode = () => {
  const snippets = [
    `function ${Math.random().toString(36).substring(7)}() { return ${random.int(1,100)}; }`,
    `const ${Math.random().toString(36).substring(7)} = ${random.int(100,1000)};`,
    `// ${Math.random().toString(36).substring(7)} comment`,
    `console.log('${Math.random().toString(36).substring(7)}');`,
    `export default ${random.int(0,1)};`
  ];
  return snippets.join(os.EOL + os.EOL);
};

const generateCommitDate = (baseDate) => {
  return baseDate
    .hour(random.int(0, 23))
    .minute(random.int(0, 59))
    .second(random.int(0, 59));
};

const makeCommitsForDate = async (date) => {
  const commitCount = random.int(COMMITS_PER_DAY * 0.5, COMMITS_PER_DAY * 1.5);
  
  for (let i = 0; i < commitCount; i++) {
    const commitDate = generateCommitDate(moment(date));
    const filePath = FILE_PATHS[random.int(0, FILE_PATHS.length - 1)];
    
    // Generate random file content
    const content = Math.random() > 0.3 
      ? generateRandomCode() 
      : JSON.stringify({ timestamp: commitDate.format(), data: random.float() });
    
    // Create directory if needed
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    
    const message = `update ${path.basename(filePath)} - ${commitDate.format('HH:mm')}`;
    
    await git
      .add(filePath)
      .commit(message, { "--date": commitDate.format() });
    
    if (i % 10 === 0) await new Promise(r => setTimeout(r, 100));
  }
};


const generateHistory = async () => {
  const startDate = moment().subtract(DAYS_TO_COVER, 'days');
  
  for (let day = 0; day < DAYS_TO_COVER; day++) {
    const currentDate = moment(startDate).add(day, 'days');
    
    // Skip some days randomly to create "gaps"
    if (random.int(0, 10) > 1) {
      console.log(`Generating commits for ${currentDate.format('YYYY-MM-DD')} (day ${day + 1}/${DAYS_TO_COVER})`);
      await makeCommitsForDate(currentDate);
    }
    
    // Push every 7 days to avoid losing progress
    if (day % 7 === 0) {
      await simpleGit().push();
    }
  }
  
  // Final push
  //await simpleGit().push();
  console.log("Commit generation complete!");
};


(async () => {
  try {
    console.log(`Generating up to ${MAX_COMMITS} commits across ${DAYS_TO_COVER} days...`);
    await generateHistory();
    console.log("Finished generating commits!");
  } catch (error) {
    console.error("Error:", error);
  }
})();
