// See: https://en.wikipedia.org/wiki/Wavefront_.obj_file

// The faces that make up a cube assuming the first vertex is 1
const defaultCubeFaces = [
  [1, 2, 4, 3],
  [3, 4, 8, 7],
  [7, 8, 6, 5],
  [5, 6, 2, 1],
  [3, 7, 5, 1],
  [8, 4, 2, 6],
]

function generateMTL(colours, name) {
  const normalize = x => (x === 0 ? 0 : x / 255).toFixed(6)

  let result = ''

  for (let i = 0; i < colours.length; i++) {
    const red = normalize((colours[i] >> 16) & 0xff)
    const green = normalize((colours[i] >> 8) & 0xff)
    const blue = normalize(colours[i] & 0xff)

    result += `newmtl ${name}-mat-${i}\nKd ${red} ${green} ${blue}\n\n`
  }

  return result
}

function pointToCube(point, faceOffset) {
  const vertices = [
    [point[0] + 0, point[1] + 0, point[2] + 1],
    [point[0] + 1, point[1] + 0, point[2] + 1],
    [point[0] + 0, point[1] + 1, point[2] + 1],
    [point[0] + 1, point[1] + 1, point[2] + 1],

    [point[0] + 0, point[1] + 0, point[2] + 0],
    [point[0] + 1, point[1] + 0, point[2] + 0],
    [point[0] + 0, point[1] + 1, point[2] + 0],
    [point[0] + 1, point[1] + 1, point[2] + 0],
  ]

  // real offset is the number of vertices times the face offset
  const offset = faceOffset * vertices.length
  const faces = defaultCubeFaces.map(face => face.map(value => value + offset))

  return { vertices, faces }
}

function generateOBJ(width, depth, height, colourIndices, uniqueColourCount) {
  const xyzToIndex = (x, y, z, width, depth) => x + width * (y + depth * z)

  const byColour = new Array(uniqueColourCount)
  for (let i = 0; i < uniqueColourCount; i++) {
    byColour[i] = []
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < depth; y++) {
      for (let z = 0; z < height; z++) {
        const colour = colourIndices[xyzToIndex(x, y, z, width, depth)]

        if (colour === -1) {
          continue
        }

        byColour[colour].push([x, y, z])
      }
    }
  }

  let cubeIndex = 0
  let result = `mtllib ${name}.mtl\n`

  for (let colourIndex = 0; colourIndex < byColour.length; colourIndex++) {
    const cubes = byColour[colourIndex].map((point, i) => pointToCube(point, cubeIndex++))
    const allVertices = [].concat(...cubes.map(cube => cube.vertices))
    const allFaces = [].concat(...cubes.map(cube => cube.faces))

    result += `\no ${name}-obj-${colourIndex}\n`
    for (let vertex of allVertices) {
      result += `v ${vertex.join(' ')}\n`
    }
    result += `usemtl ${name}-mat-${colourIndex}\n`
    result += `s off\n`
    for (let face of allFaces) {
      result += `f ${face.join(' ')}\n`
    }
  }

  return result
}

function isolateColours(colours) {
  const uniqueColours = []
  const colourIndices = new Array(colours.length / 3).fill(-1)

  for (let i = 0, bytePos = 0; bytePos < colours.length; i++, bytePos += 3) {
    const colour = colours.readUIntBE(bytePos, 3);

    if (colour === 0) {
      continue
    }

    const colourIndex = uniqueColours.indexOf(colour)
    if (colourIndex === -1) {
      uniqueColours.push(colour)
      colourIndices[i] = uniqueColours.length - 1
    } else {
      colourIndices[i] = colourIndex
    }
  }

  return { uniqueColours, colourIndices }
}

function convertCub(data, name) {
  const width = data.readUInt32LE(0)
  const depth = data.readUInt32LE(4)
  const height = data.readUInt32LE(8)

  const { colourIndices, uniqueColours } = isolateColours(data.slice(12))

  return {
    obj: generateOBJ(width, depth, height, colourIndices, uniqueColours.length),
    mtl: generateMTL(uniqueColours, name),
  }
}

// Main Program
import { readFileSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

// CLI arguments
const file = process.argv[2]
const outFolder = process.argv[3]

// Read and convert data
const content = readFileSync(file) // read as binary
const name = basename(file, '.cub')
const { obj, mtl } = convertCub(content, name)

// Write files
writeFileSync(join(outFolder, `${name}.obj`), obj, 'utf-8')
writeFileSync(join(outFolder, `${name}.mtl`), mtl, 'utf-8')
