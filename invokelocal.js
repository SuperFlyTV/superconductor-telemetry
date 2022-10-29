const path = require('path')
const fs = require('fs/promises')

const basePath = './superconductor-telemetry'

;(async () => {
	// Load env

	process.env = { ...process.env } // make a copy
	const envFile = await fs.readFile(`${basePath}/.env`, 'utf-8')
	for (let line of envFile.split('\n')) {
		line = line.trim()
		const m = line.split('=')
		if (m.length === 2) {
			const key = m[0]
			let value = JSON.parse(m[1])
			process.env[key] = value
		}
	}

	// Load CLI arguments
	const scriptPath = process.argv[2]

	const args = {}
	for (let i = 3; i < process.argv.length; i += 2) {
		const key = process.argv[i]
		const value = process.argv[i + 1]
		if (key !== undefined && value !== undefined) {
			args[key] = value
		}
	}

	const fullScriptPath = path.resolve(
		`${basePath}/packages/telemetry/${scriptPath}/index.js`
	)
	console.log(`Executing ${fullScriptPath}`)
	console.log(`with rguments: ${JSON.stringify(args)}`)
	console.log('---------------------------------------')
	const req = require(fullScriptPath)

	const result = await req.main(args)

	console.log(result)
	console.log('Done')
})().catch(console.error)
