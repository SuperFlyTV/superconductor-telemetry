const { createClient } = require('@supabase/supabase-js')

/*
 * This endpoint is used to generate reports
 */

async function main(args) {
	if (!args.accessToken) {
		return {
			body: 'accessToken missing'
		}
	}
	if (args.accessToken !== process.env['ACCESS']) {
		return {
			body: 'accessToken incorrect'
		}
	}
	const supabase = createClient(
		'https://ksjcdmfakfozzlqmmgng.supabase.co',
		process.env['SUPABASE']
	)

	const resultAppStart = await supabase
		.from('superconductor-telemetry')
		.select()
		.eq('reportType', 'application-start')
		.order('id', { ascending: false })

	if (resultAppStart.error) {
		return {
			body: {
				error: resultAppStart.error
			}
		}
	}

	const resultApplicationStartCount = await supabase
		.from('superconductor-telemetry')
		.select('*', { count: 'exact', head: true })
		.eq('reportType', 'application-start')

	if (resultApplicationStartCount.error) {
		return {
			body: {
				error: resultAppStart.error
			}
		}
	}

	const resultAcceptUserAgreement = await supabase
		.from('superconductor-telemetry')
		.select()
		.eq('reportType', 'accept-user-agreement')
		.order('id', { ascending: false })

	if (resultAcceptUserAgreement.error) {
		return {
			body: {
				error: resultAppStart.error
			}
		}
	}

	const resultUserAgreementCount = await supabase
		.from('superconductor-telemetry')
		.select('*', { count: 'exact', head: true })
		.eq('reportType', 'accept-user-agreement')

	if (resultUserAgreementCount.error) {
		return {
			body: {
				error: resultAppStart.error
			}
		}
	}

	const resultErrors = await supabase
		.from('superconductor-telemetry')
		.select()
		.eq('reportType', 'application-error')
		.order('id', { ascending: false })
		.range(0, 100)

	if (resultErrors.error) {
		return {
			body: {
				error
			}
		}
	}

	const errors = []
	let versions = {}
	let startsPerDate = {}
	let dateVersions = {}
	let osType = {}
	let osTypeVersion = {}
	let acceptCount = {}
	let acceptsPerDate = {}

	for (const row of resultAppStart.data) {
		const report = parseReport(row.report)
		if (!report) continue

		if (!startsPerDate[report.date]) startsPerDate[report.date] = 0
		startsPerDate[report.date]++

		// Version per date:
		if (!dateVersions[report.date]) dateVersions[report.date] = {}
		if (!dateVersions[report.date][report.version])
			dateVersions[report.date][report.version] = 0
		dateVersions[report.date][report.version]++

		if (!osType[report.osType]) osType[report.osType] = 0
		osType[report.osType]++

		const osVersion = report.osType + '__' + report.osRelease
		if (!osTypeVersion[osVersion]) osTypeVersion[osVersion] = 0
		osTypeVersion[osVersion]++
	}
	for (const row of resultAcceptUserAgreement.data) {
		const report = parseReport(row.report)
		if (!report) continue

		if (!acceptCount[report.userAgreementVersion])
			acceptCount[report.userAgreementVersion] = 0
		acceptCount[report.userAgreementVersion]++

		if (!acceptsPerDate[report.date]) acceptsPerDate[report.date] = 0
		acceptsPerDate[report.date]++
	}
	for (const row of resultErrors.data) {
		const report = parseReport(row.report)
		if (!report) continue

		errors.push(report)
	}

	startsPerDate = sortObject(startsPerDate)
	acceptsPerDate = sortObject(acceptsPerDate)
	dateVersions = sortObject(dateVersions)
	osType = sortObject(osType)
	osTypeVersion = sortObject(osTypeVersion)
	acceptCount = sortObject(acceptCount)

	dateVersions = sortObject(dateVersions)
	for (let key of Object.keys(dateVersions)) {
		dateVersions[key] = sortObject(dateVersions[key])
	}

	return {
		body: {
			_applicationStartsCount: resultApplicationStartCount.count,
			_acceptUserAgreement: resultUserAgreementCount.count,
			_applicationStartsPerDate: startsPerDate,
			_userAgreementsPerDate: acceptsPerDate,
			_applicationStartsPerDateAndVersion: dateVersions,
			_osType: osType,
			_osTypeVersion: osTypeVersion,

			errors: errors
		}
	}
}

function sortObject(obj) {
	const obj2 = {}
	const keys = Object.keys(obj)
	keys.sort((a, b) => {
		if (a > b) return 1
		if (a < b) return -1
		return 0
	})
	for (const key of keys) {
		obj2[key] = obj[key]
	}
	return obj2
}
function fixDate(str) {
	const match = `${str}`.match(/(\d+)-(\d+)-(\d+)/)
	if (match) {
		const y = match[1]
		const m = match[2]
		const d = match[3]

		return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`
	}
	return str
}
function pad(str, length) {
	return '000000000000'.slice(0, length - str.length) + str
}
function parseReport(reportStr) {
	try {
		const report = JSON.parse(reportStr)
		report.date = fixDate(report.date) // YYYY-M-D -> YYYY-MM-DD
		return report
	} catch (err) {
		return null
	}
}

module.exports = {
	main
}
