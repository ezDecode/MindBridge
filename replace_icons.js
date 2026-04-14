const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

// Common mappings for Feather -> Solar
// If an exact equivalent isn't mapped, it will derive a kebab-case name.
function getSolarIcon(fiIcon) {
    let name = fiIcon.replace(/^Fi/, '');
    name = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    
    const overrides = {
        'check-circle': 'check-circle',
        'x': 'close-circle',
        'menu': 'hamburger-menu',
        'user': 'user',
        'calendar': 'calendar',
        'clock': 'clock-circle',
        'message-square': 'chat-round',
        'phone': 'phone',
        'settings': 'settings',
        'search': 'magnifer',
        'bell': 'bell',
        'home': 'home-2',
        'star': 'star',
        'heart': 'heart',
        'map-pin': 'map-point',
        'chevron-down': 'alt-arrow-down',
        'chevron-right': 'alt-arrow-right',
        'chevron-left': 'alt-arrow-left',
        'chevron-up': 'alt-arrow-up',
        'arrow-right': 'arrow-right',
        'arrow-left': 'arrow-left',
        'external-link': 'square-top-down',
        'info': 'info-circle',
        'alert-circle': 'danger-circle'
    };

    return `solar:${overrides[name] || name}-linear`;
}

function walkSync(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, filelist);
        } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
            filelist.push(filepath);
        }
    }
    return filelist;
}

const files = walkSync(directory);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fi['"];?/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
        const importStatement = match[0];
        const imports = match[1].split(',').map(i => i.trim()).filter(Boolean);
        
        imports.forEach(icon => {
            const solarIcon = getSolarIcon(icon);
            // Replace JSX tags <FiName .../>
            const usageRegex = new RegExp(`<${icon}([^>]*)>`, 'g');
            content = content.replace(usageRegex, `<Icon icon="${solarIcon}"$1>`);
            
            // Replaces component references passed as props (e.g., icon={FiName})
            // We use an arrow function mapping to Icon, which is a bit of a hack but works
            const referenceRegex = new RegExp(`\\b${icon}\\b(?![\\w\\-])`, 'g');
            // We skip replacing the import itself or the JSX tags (handled above)
            // It's safer to not do this blindly and just let typescript flag if something breaks, but let's try.
        });

        // Add the Iconify import.
        // We'll insert it at the position of the old import.
        const newImport = `import { Icon } from '@iconify/react';`;
        content = content.replace(importStatement, newImport);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        changedFiles++;
    }
});

console.log(`Done. Changed ${changedFiles} files.`);