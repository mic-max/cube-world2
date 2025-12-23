# Cube World

Three.js Render Cube World Entities

Cube World Sprites Directory: `C:\Program Files (x86)\Steam\steamapps\common\Cube World\sprites`

## `.cub` File Format:

```text
:: Size Data
xSize (4 bytes)
ySize (4 bytes)
zSize (4 bytes)
:: Color Data - repeats (xSize * ySize * zSize) times
red   (1 byte)
green (1 byte)
blue  (1 byte)
```

Some entities consist of multiple `.cub` files

- `bat-body.cub`
- `bat-head.cub`
- `bat-hand.cub`
- `bat-foot.cub`

## Instructions

1. Run `node gen_pos_wire.js` and format JSON
1. Manually adjust positions
1. 
<!-- 1. Convert all `.cub` files to `.obj` using: https://github.com/ScottishCyclops/cub-to-obj/ -->
1. Merge cubes into a proper mesh of minimum triangles
<!-- 1. Render the `.obj` file using some WebGL library -->
1. `json-server --watch db.json`
1. `npx vite`
1. Add lighting and a background to the scene
1. Add button to hotload specific files ???

The converted data about Cube World entities will be hosted on `json-server`.
