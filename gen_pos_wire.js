const fs = require('fs');

// Main
const pos = {};

const spritesPath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Cube World\\sprites\\';
const bodyParts = {
    'body': 1,
    'head': 1,
    'foot': 2,
    'hand': 2,
    'tail': 1,
    'hair': 1,
    'wings': 1,
};

let sprites = fs.readdirSync(spritesPath);
sprites.sort(); // TODO: by length?

for (let filename of sprites) {
    for (let bodyPart in bodyParts) {
        const idx = filename.indexOf('-' + bodyPart);
        if (idx !== -1) {
            let entityName = filename.substring(0, idx);
            if (!pos[entityName])
                pos[entityName] = {};

            pos[entityName][bodyPart] = [];
            for (let i = 0; i < bodyParts[bodyPart]; i++) {
                pos[entityName][bodyPart].push([0, 0, 0]);
            }
        }
    }
};

fs.writeFileSync("pos.json", JSON.stringify(pos));
