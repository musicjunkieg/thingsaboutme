const fs = require('fs');
const path = require('path');

// Read the markdown content
const markdownContent = fs.readFileSync('content.md', 'utf8');

// Extract the things from markdown (looking for ## followed by number)
const things = [];
const lines = markdownContent.split('\n');
let currentThing = '';
let inThing = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a numbered heading (## 1, ## 2, etc.)
    if (line.match(/^## \d+$/)) {
        // Save previous thing if we have one
        if (inThing && currentThing.trim()) {
            things.push(currentThing.trim());
        }
        // Start new thing
        currentThing = '';
        inThing = true;
    } else if (inThing && line && !line.startsWith('#')) {
        // Add content to current thing
        if (currentThing) currentThing += ' ';
        currentThing += line;
    } else if (line.startsWith('# ') || line.startsWith('## ')) {
        // Hit another heading, save current thing
        if (inThing && currentThing.trim()) {
            things.push(currentThing.trim());
            currentThing = '';
            inThing = false;
        }
    }
}

// Don't forget the last thing
if (inThing && currentThing.trim()) {
    things.push(currentThing.trim());
}

// Filter out placeholder content
const filteredThings = things.filter(thing => 
    thing && 
    !thing.includes('[Add your next thing here]') && 
    !thing.includes('TODO') &&
    thing.length > 10
);

console.log(`Found ${filteredThings.length} things`);

// Read the HTML template
let htmlTemplate = fs.readFileSync('index.html', 'utf8');

// Create the JavaScript array string
const thingsArray = JSON.stringify(filteredThings, null, 12);

// Replace the placeholder in the HTML
const updatedHtml = htmlTemplate.replace(
    /const things = \[[\s\S]*?\];/,
    `const things = ${thingsArray};`
);

// Write the updated HTML
fs.writeFileSync('index.html', updatedHtml);

// Update the _redirects file to include all the numbers
const redirectsContent = filteredThings.map((_, index) => {
    const num = index + 1;
    return `/${num} /#thing-${num} 302`;
}).join('\n') + '\n';

fs.writeFileSync('_redirects', redirectsContent);

console.log('✅ Built successfully!');
console.log(`📝 ${filteredThings.length} things published`);
console.log(`🔗 URLs /1 through /${filteredThings.length} are available`);
