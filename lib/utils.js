const Channel = require("@models/Channel")
const bcrypt = require("bcryptjs")
const crypto = require('crypto')

// Function to get timestamp difference from the createdAt time
const getTimestamp = (createdAt) => {
  const now = new Date()
  const timeDifference = now.getTime() - createdAt.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (timeDifference < minute) {
    const seconds = Math.floor(timeDifference / 1000)
    return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`
  } else if (timeDifference < hour) {
    const minutes = Math.floor(timeDifference / minute)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  } else if (timeDifference < day) {
    const hours = Math.floor(timeDifference / hour)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  } else if (timeDifference < week) {
    const days = Math.floor(timeDifference / day)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  } else if (timeDifference < month) {
    const weeks = Math.floor(timeDifference / week)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else if (timeDifference < year) {
    const months = Math.floor(timeDifference / month)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(timeDifference / year)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}

// Function to generate a unique ID based on input, length, and prefix
const generateID = (input, length, pre) =>
  `${pre || 'UC'}${Buffer.from(bcrypt.hashSync(input, 10)).toString("base64").slice(10, length + 10 || 32)}`.trim()

// Function to format numbers into a human-readable format
const formatNumber = num => num >= 1e6 ? (num / 1e6).toFixed(2) + "M" : num >= 1e3 ? (num / 1e3).toFixed(2) + "K" : Math.floor(num).toString()

// Function to generate a signature for BunnyCDN
const generateSignature = (libraryId, apiKey, expirationTime, videoId) => {
  const stringToSign = libraryId + apiKey + expirationTime + videoId
  const hash = crypto.createHash('sha256')
  hash.update(stringToSign)
  return hash.digest('hex')
}

function convertMetaTagsToObject(metaTags) {
  return metaTags.reduce((obj, item) => {
    obj[item.property] = item.value
    return obj
  }, {})
}

async function createUniqueHandle(baseHandle) {
  let handle = baseHandle
  if (!await Channel.findOne({ handle })) return handle
  while (await Channel.findOne({ handle })) {
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const candidateHandles = Array.from({ length: 10 }, () => `${baseHandle}${randomDigits}`)
    const existingHandles = await Channel.find({ handle: { $in: candidateHandles } }, 'handle')
    const existingSet = new Set(existingHandles.map(doc => doc.handle))
    handle = candidateHandles.find(candidate => !existingSet.has(candidate))
  }
  return handle
}

// Exporting the functions for use in other parts of the application
module.exports = { convertMetaTagsToObject, createUniqueHandle, getTimestamp, generateID, formatNumber, generateSignature }
