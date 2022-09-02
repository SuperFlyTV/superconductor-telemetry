const { createClient } = require('@supabase/supabase-js')

async function main(args) {
	if (args.report) {
		const supabase = createClient('https://ksjcdmfakfozzlqmmgng.supabase.co', process.env['SUPABASE'])

		const { error } = await supabase
			.from('superconductor-telemetry')
			.insert([{
				report: args.report
			}])

		if (error) {
			return {
				"body": 'Error when inserting row: ' + error
			}
		}


		return {
			"body": 'ok!'
		}
	}
}
module.exports = {
	main
}

