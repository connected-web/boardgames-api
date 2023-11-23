import { _Object } from '@aws-sdk/client-s3'
import getJsonObject, { JsonArray, JsonObject } from '../getJson'
import interfaces from '../interfaces'

export type RecordList = JsonObject[]

export interface DateCodeMatch {
  dateCode: string
  yearCode?: string
  monthCode?: string
  valid: boolean
}

export async function getPlayRecordsByDateCode (dateCode: string, forceUpdate: boolean = false): Promise<RecordList> {
  const dateCodeMatch = matchDateCode(dateCode)
  const byGroup = dateCodeMatch?.monthCode === undefined ? 'byYear' : 'byMonth'

  if (byGroup === 'byYear') {
    return await getPlayRecordsByYear(dateCode, forceUpdate)
  } else {
    return await getPlayRecordsByMonth(dateCode, forceUpdate)
  }
}

export function matchDateCode (dateCode: string): DateCodeMatch {
  const dateCodeMatcher = /^(\d{4})(?:-(\d{2}))?$/
  const match = dateCode.match(dateCodeMatcher)

  if (match !== null) {
    const yearCode = match[1]
    const monthCode = match[2]

    console.log('Year Code:', yearCode)
    console.log('Month Code:', monthCode)

    return { dateCode, yearCode, monthCode, valid: true }
  } else {
    console.log('Invalid date code format.')
    return { dateCode, valid: false }
  }
}

export async function getPlayRecordsByAllTime (forceUpdate: boolean = false): Promise<RecordList> {
  const { console, getBucketName, putObject } = interfaces.get()
  const bucket = getBucketName()
  const groupedRecordKey = 'grouped/byAllTime/all_playrecords.json'

  if (!forceUpdate) {
    let existingRecords: JsonArray
    try {
      existingRecords = (await getJsonObject(groupedRecordKey)) as JsonArray
      if (existingRecords.length > 0) {
        console.log(`[List Play Records by All Time] Found ${existingRecords.length} play records cached in (${groupedRecordKey})`)
        return (existingRecords) ?? []
      }
    } catch (ex) {
      const error = ex as Error
      console.log(`[List Play Records by All Time] No grouped records found for: (${groupedRecordKey}), Error: `, error.message)
    }
  }

  // fall through if no cached records

  const now = new Date()
  const startYear = 2022
  const currentYear = now.getFullYear()

  const work = []
  let workYear = startYear
  while (workYear <= currentYear) {
    const isCurrentYear = workYear === currentYear
    const shouldUpdate = isCurrentYear
    const task = getPlayRecordsByDateCode(`${workYear}`, shouldUpdate)
    work.push(task)
    workYear++
  }

  const records: RecordList = (await Promise.all(work)).flat()

  await putObject({
    Bucket: bucket,
    Key: groupedRecordKey,
    Body: JSON.stringify(records)
  })

  return records
}

export async function getPlayRecordsByYear (dateCode: string, forceUpdate: boolean = false): Promise<RecordList> {
  const { console, getBucketName, putObject } = interfaces.get()
  const bucket = getBucketName()
  const groupedRecordKey = `grouped/byYear/${dateCode}_playrecords.json`
  const dateCodeMatch = matchDateCode(dateCode)

  if (!dateCodeMatch.valid) {
    throw new Error(`Date code not valid for year: ${dateCode}, expected format: YYYY or YYYY-DD`)
  }
  const yearCode = dateCodeMatch?.yearCode ?? 'year-not-set'

  if (!forceUpdate) {
    let existingRecords: JsonArray
    try {
      existingRecords = (await getJsonObject(groupedRecordKey)) as JsonArray
      if (existingRecords.length > 0) {
        console.log(`[List Play Records by Date Code] Found ${existingRecords.length} play records cached in (${groupedRecordKey})`)
        return (existingRecords) ?? []
      }
    } catch (ex) {
      const error = ex as Error
      console.log(`[List Play Records by Date Code] No grouped records found for: (${groupedRecordKey}), Error: `, error.message)
    }
  }

  // fall through if no cached records
  const now = new Date()
  const startMonth = 1
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const isCurrentYear = `${currentYear}` === dateCodeMatch.yearCode
  const lastMonthInYear = isCurrentYear ? currentMonth : 12

  const work = []
  let workMonth = startMonth
  while (workMonth <= lastMonthInYear) {
    const isCurrentMonth = workMonth === currentMonth
    const isPreviousMonth = workMonth === currentMonth - 1
    const shouldUpdate = (isCurrentYear && isCurrentMonth) || isPreviousMonth
    const monthCode = workMonth >= 10 ? `${workMonth}` : `0${workMonth}`
    const task = getPlayRecordsByMonth(`${yearCode}-${monthCode}`, shouldUpdate)
    work.push(task)
    workMonth++
  }

  const records: RecordList = (await Promise.all(work)).flat()

  await putObject({
    Bucket: bucket,
    Key: groupedRecordKey,
    Body: JSON.stringify(records)
  })

  return records
}

export async function getPlayRecordsByMonth (dateCode: string, forceUpdate: boolean = false): Promise<RecordList> {
  const { console, getBucketName, putObject } = interfaces.get()
  const bucket = getBucketName()
  const groupedRecordKey = `grouped/byMonth/${dateCode}_playrecords.json`
  const dateCodeMatch = matchDateCode(dateCode)

  if (!dateCodeMatch.valid || dateCodeMatch.monthCode === undefined) {
    throw new Error(`Date code not valid as month: ${dateCode}, expected format: YYYY-DD`)
  }

  let records: RecordList = []
  if (!forceUpdate) {
    let existingRecords: JsonArray
    try {
      existingRecords = (await getJsonObject(groupedRecordKey)) as JsonArray
      if (existingRecords.length > 0) {
        console.log(`[List Play Records by Date Code] Found ${existingRecords.length} play records cached in (${groupedRecordKey})`)
        return (existingRecords) ?? []
      }
    } catch (ex) {
      const error = ex as Error
      console.log(`[List Play Records by Date Code] No grouped records found for: (${groupedRecordKey}), Error: `, error.message)
    }
  }

  // fall through if no cached records
  records = await getOriginalPlayRecordsByDateCode(dateCode)

  await putObject({
    Bucket: bucket,
    Key: groupedRecordKey,
    Body: JSON.stringify(records)
  })

  return records
}

export async function getOriginalPlayRecordsByDateCode (dateCode: string): Promise<RecordList> {
  const { console, getBucketName, listObjects } = interfaces.get()
  const bucket = getBucketName()

  console.log(`[List Play Records by Date Code] Searching for matching records to cache: (${dateCode})`)
  const recordSearch = await listObjects({
    Bucket: bucket,
    Prefix: `original/${dateCode.replace('-', '/')}/`
  })
  const recordList = recordSearch?.Contents ?? []
  const recordKeys = recordList
    .filter((item: _Object) => {
      const isJson = item?.Key?.includes('.json') === true
      const isApiKey = item?.Key?.includes('apiKeys') === true
      const isGrouped = item?.Key?.includes('grouped') === true
      return isJson && !isGrouped && !isApiKey
    })
    .map((item: any) => item.Key)
  const recordGathering = recordKeys.map(getJsonObject)
  const records = await Promise.all(recordGathering)

  return records
}
