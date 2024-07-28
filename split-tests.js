// split-tests.js
const fs = require('fs');
const path = require('path');

const testDir = 'cypress/e2e'; // Directory containing test files
const groupCount = process.argv[2] || 3; // Number of groups
const outputFile = process.argv[3] || 'test-groups.json'; // Output file

const getAllTestFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTestFiles(file));
    } else if (file.endsWith('.cy.js')) {
      results.push(file);
    }
  });
  return results;
};

const files = getAllTestFiles(testDir);
const groups = Array.from({ length: groupCount }, () => []);

files.forEach((file, index) => {
  groups[index % groupCount].push(file);
});

fs.writeFileSync(outputFile, JSON.stringify(groups, null, 2));

groups.forEach((group, i) => {
  let scriptContent;
  if (group.length > 1) {
    const specs = group.join('","');
    scriptContent = `npx cypress run --headed --spec "${specs}"`;
  } else if (group.length === 1) {
    scriptContent = `npx cypress run --headed --spec "${group[0]}"`;
  } else {
    scriptContent = '';
  }
  fs.writeFileSync(`run-group-${i + 1}.bat`, scriptContent);
});