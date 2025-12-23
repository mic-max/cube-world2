// Find a list of all the sprites - sometimes more than 1 CUB file

import { readdirSync } from 'fs'

const bodyPartNames = new Set([
    'body',
    'foot',
    'hand',
    'hair',
    'head',
    'tail',
    'wings',
])

const filenames = readdirSync('sprites').map(x => x.substr(0, x.length - 4))

const allParts = new Set()

for (let filename of filenames) {
    if (filename.indexOf('.') !== -1) {
        // Skip 'beaver.body' and 'beaver.head'
        continue
    }

    filename = filename.replace(/(\d+)/g, '-$1')

    const parts = filename.split('-')
    for (let part of parts) {
        allParts.add(part)
    }

    // for (let i = parts.length - 1; i >= 1; i--) {
    //     if (bodyPartNames.has(parts[i])) {
    //         const baseEntity = filename.substr(0, lastIndex)
    //         if (!animals[baseEntity]) {
    //             animals[baseEntity] = []
    //         }
    //         animals[baseEntity].push(parts[i])
    //     } else {
    //         console.error(filename)
    //     }
    // }
}

let sorted = Array.from(allParts).sort()
for (let s of sorted) {
    console.error(s)
}
console.error(sorted.length)
