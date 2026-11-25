// All the requests to the Express API go through this file.
// /api is sent to the API by Vite (see vite.config.js): /api/stats becomes GET http://localhost:3000/stats
const API_URL = '/api'

const NOT_REACHABLE = 'Cannot reach the API. Start it with npm run dev in the project folder.'

// Sends a GET request and returns the JSON answer, or throws an Error with the message of the API
export async function getJson(path) {
  let response
  try {
    response = await fetch(API_URL + path)
  } catch {
    throw new Error(NOT_REACHABLE)
  }

  // The API always answers in JSON, so an answer that is not JSON comes from Vite: the API is not running
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    if (body?.error) throw new Error(body.error)
    throw new Error(response.status >= 500 ? NOT_REACHABLE : `The API answered with status ${response.status}`)
  }

  return body
}
