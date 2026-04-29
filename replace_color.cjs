const fs = require('fs');
const path = require('path');

function replaceColorInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/#00F0FF/gi, '#4ea8de');
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

const files = [
  "/src/index.css",
  "/src/App.tsx",
  "/src/components/Organizations.tsx",
  "/src/components/Footer.tsx",
  "/src/components/ThreeCircles.tsx",
  "/src/components/Navigation.tsx",
  "/src/components/FeaturedProject.tsx",
  "/src/components/Projects.tsx",
  "/src/components/Hero.tsx",
  "/src/components/Experience.tsx"
];

files.forEach(file => replaceColorInFile(file));
console.log("Color replacement complete.");
