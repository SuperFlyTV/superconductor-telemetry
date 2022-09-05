const { createClient } = require('@supabase/supabase-js')

/*
 * This endpoint is used by SuperConductor to upload its data reports
*/

async function main(args) {
	if (args.report) {
		const supabase = createClient(
			'https://ksjcdmfakfozzlqmmgng.supabase.co',
			process.env['SUPABASE']
		)

		let reportType = null
		let version = null

		try {
			const parsed = JSON.parse(args.report)

			reportType = parsed.reportType
			version = parsed.version
		} catch (err) {
			// Ignore parse errors
		}

		const { error } = await supabase
			.from('superconductor-telemetry')
			.insert([
				{
					reportType,
					version,
					report: args.report
				}
			])

		if (error) {
			return {
				body: 'Error when inserting row: ' + error
			}
		}

		return {
			body: 'ok!'
		}
	}
}
module.exports = {
	main
}
