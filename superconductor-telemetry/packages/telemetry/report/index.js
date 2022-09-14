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

	const result = await supabase
		.from('superconductor-telemetry')
		.select()
		.neq('reportType', 'application-error')
		.order('id', { ascending: false })

	if (result.error) {
		return {
			body: {
				error
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

	const rows = result.data

	let reports = {}
	const errors = []
	let versions = {}
	let dates = {}
	let dateVersions = {}
	let osType = {}
	let osTypeVersion = {}
	let acceptCount = {}
	let reportCount = {}

	for (const row of rows) {
		let report
		try {
			report = JSON.parse(row.report)
		} catch (err) {
			continue
		}

		if (report.reportType === 'application-start') {

			report.date = fixDate(report.date) // YYYY-M-D -> YYYY-MM-DD

			if (!versions[report.version]) versions[report.version] = 0
			versions[report.version]++

			if (!dates[report.date]) dates[report.date] = 0
			dates[report.date]++

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
		} else if (report.reportType === 'accept-user-agreement') {
			if (!acceptCount[report.userAgreementVersion])
				acceptCount[report.userAgreementVersion] = 0
			acceptCount[report.userAgreementVersion]++
		}

		if (!reportCount[report.reportType]) reportCount[report.reportType] = 0
		reportCount[report.reportType]++

		if (!reports[report.reportType]) reports[report.reportType] = []
		reports[report.reportType].push(report)
	}

	versions = sortObject(versions)
	dates = sortObject(dates)
	dateVersions = sortObject(dateVersions)
	osType = sortObject(osType)
	osTypeVersion = sortObject(osTypeVersion)
	acceptCount = sortObject(acceptCount)
	reportCount = sortObject(reportCount)

	dateVersions = sortObject(dateVersions)
	for (let key of Object.keys(dateVersions)) {
		dateVersions[key] = sortObject(dateVersions[key])
	}

	for (const row of resultErrors.data) {
		let report
		try {
			report = JSON.parse(row.report)
		} catch (err) {
			continue
		}

		report.date = fixDate(report.date) // YYYY-M-D -> YYYY-MM-DD

		errors.push(report)
	}

	return {
		body: {
			_Count: rows.length,
			_reportCount: reportCount,
			_versions: versions,
			_dates: dates,
			_dateVersions: dateVersions,
			_osType: osType,
			_osTypeVersion: osTypeVersion,
			_acceptCount: acceptCount,
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

module.exports = {
	main
}
