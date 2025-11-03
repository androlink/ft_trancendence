import en from "./languages/en.js"
import fr from "./languages/fr.js"
import es from "./languages/es.js"


/**
 * creates strings according to the translations in the files in /language
 * @param {string} NAME name of the translation
 * @param  {...string} args substring to set inside the translatins
 * @returns an object containing the strings created or error message string
 */
export function search_languages_packs(NAME, ...args){
  return {
    en: Object.hasOwn(en, NAME) ? en[NAME](...args) : `Translation ${NAME} not found`,
    fr: Object.hasOwn(fr, NAME) ? fr[NAME](...args) : `Traduction ${NAME} non trouvée`,
    es: Object.hasOwn(es, NAME) ? es[NAME](...args) : `Traducción ${NAME} no encontrada`,
  }
}

/**
 * a collections of functions that return their text in different languages
 * the point of using the export default if to have a list of know message names for the code editor
 * 
 * « MSG.NAME(arg1, arg2, ...)» is equivalent to « search_languages_packs(NAME, arg1, arg2, ...) »
*/
export default {
  USERNAME_TAKEN: (username) => search_languages_packs("USERNAME_TAKEN", username),
  DB_REFUSED_MSG: () => search_languages_packs("DB_REFUSED_MSG"),
  REFUSED_ADMIN: () => search_languages_packs("REFUSED_ADMIN"),
  NOT_RECOGNIZED: () => search_languages_packs("NOT_RECOGNIZED"),
  USERNAME_NOT_FOUND: (username) => search_languages_packs("USERNAME_NOT_FOUND", username),
  WELCOME_USERNAME: (username = "") => search_languages_packs("WELCOME_USERNAME", username),
  NOT_IN_DB: () => search_languages_packs("NOT_IN_DB"),
  GOODBYE: () => search_languages_packs("GOODBYE"),
  EXPECTED_FORMBODY: (method, url) => search_languages_packs("EXPECTED_FORMBODY", method, url),
  EXPECTED_CONTENT_TYPE: (method) => search_languages_packs("EXPECTED_CONTENT_TYPE", method),
  ALPHANUMERIC_: (field) => search_languages_packs("ALPHANUMERIC_", field),
  MAX_BYTE_LENGTH: (field, byteLength) => search_languages_packs("MAX_BYTE_LENGTH", field, byteLength),
  MAX_STR_LENGTH: (field, length) => search_languages_packs("MAX_STR_LENGTH", field, length),
  MIN_STR_LENGTH: (field, length) => search_languages_packs("MIN_STR_LENGTH", field, length),
  MUST_BE_STR: (field) => search_languages_packs("MUST_BE_STR", field),
  WRONG_PASSWORD: () => search_languages_packs("WRONG_PASSWORD"),
  WRONG_USERNAME: () => search_languages_packs("WRONG_USERNAME"),
  LOGIN: () => search_languages_packs("LOGIN"),
  YOU: () => search_languages_packs("YOU"),
  PONG_SOON: () => search_languages_packs("PONG_SOON"),
  BORING: () => search_languages_packs("BORING"),
  NEED_ADMIN: () => search_languages_packs("NEED_ADMIN"),
  THAT_IS_YOU: () => search_languages_packs("THAT_IS_YOU"),
  UN_FRIEND_REQUEST: () => search_languages_packs("UN_FRIEND_REQUEST"),
  UN_FRIEND: () => search_languages_packs("UN_FRIEND"),
  UN_BLOCK: () => search_languages_packs("UN_BLOCK"),
  BLOCK: () => search_languages_packs("BLOCK"),
  REQUEST_FRIEND: () => search_languages_packs("REQUEST_FRIEND"),
  ACCEPT_FRIEND: () => search_languages_packs("ACCEPT_FRIEND"),
  NO_FILE: () => search_languages_packs("NO_FILE"),
  NOT_IMG: () => search_languages_packs("NOT_IMG"),
  ERR_400: () => search_languages_packs("ERR_400"),
  ERR_404: () => search_languages_packs("ERR_404"),
  ERR_413: () => search_languages_packs("ERR_413"),
};