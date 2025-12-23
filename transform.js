const fs = require('fs');
const path = require('path');
const positions = require('./pos1.json');

// Main
const db = {
    names: [],
    entities: []
};

const bodyParts = ['body', 'foot', 'hand', 'head', 'tail', 'hair', 'wings'];

const spritesPath = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Cube World\\sprites\\'
let sprites = fs.readdirSync(spritesPath);
sprites.sort() // TODO: by length?

for (let filename of sprites) {
    const spriteName = path.parse(filename).name;

    // if (!spriteName.includes('alpaca') && !spriteName.includes("emerald"))
    //     continue

    const buffer = fs.readFileSync(spritesPath + filename);
    const x = buffer.readUIntLE(0, 4);
    const y = buffer.readUIntLE(4, 4);
    const z = buffer.readUIntLE(8, 4);

    let colors = []
    for (let i = 12; i < buffer.length; i += 3)
        colors.push(buffer.readUIntBE(i, 3));

    const part = {
        size: [x, y, z],
        positions: [[0, 0, 0]],
        color: colors
    }

    let entityName = null;
    let partName = null;
    for (let bodyPart of bodyParts) {
        const idx = filename.indexOf('-' + bodyPart)
        if (idx !== -1) {
            partName = bodyPart;
            entityName = filename.substring(0, idx);
            break;
        }
    }

    if (!entityName) {
        db.names.push(spriteName)
        db.entities.push({ name: spriteName, parts: { "x": part }});
        continue;
    }

    part.positions = positions[entityName][partName];
    const idx = db.entities.map(x => x.name).indexOf(entityName);
    if (idx !== -1) {

        db.entities[idx].parts[partName] = part
    } else {
        db.names.push(entityName);
        db.entities.push({ name: entityName, parts: { [partName]: part } });
    }
};

fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
