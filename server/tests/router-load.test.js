const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const fs = require('node:fs')

const routesDir = path.join(__dirname, '..', 'routes')
const skipFiles = new Set(['discordRoutes.js', 'serviceEquipmentDocs.js'])

for (const file of fs.readdirSync(routesDir)) {
  if (!file.endsWith('.js') || skipFiles.has(file)) continue

  test(`routes/${file} loads without crashing`, () => {
    const exported = require(path.join(routesDir, file))
    assert.ok(exported, 'module should export a value')

    const isRouterFunction = typeof exported === 'function' && typeof exported.use === 'function'
    const isRouterObject = exported && typeof exported === 'object' && typeof exported.use === 'function'
    assert.ok(isRouterFunction || isRouterObject, 'expected an Express router export')
  })
}