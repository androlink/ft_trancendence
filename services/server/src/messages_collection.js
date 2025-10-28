/**
 * a collections of functions that return their text in different languages
*/
export default {
  USERNAME_TAKEN: (username) => ({
    en: `"${username}" is already taken`,
    fr: `"${username}" est deja pris`,
    es: `"${username}" ya está tomado`,
  }),
  DB_REFUSED_MSG: () => ({
    en: "The db said no",
    fr: "La base de données refuse",
    es: "la base de datos se negó",
  }),
  REFUSED_ADMIN: () => ({
    en: "Noo Stop You're admin",
    fr: "STP t'es admin arrête",
    es: "¡Detente! Eres un administrador",
  }),
  NOT_RECOGNIZED: () => ({
    en: "The glorious backend said you are not connected, sorry",
    fr: "Le glorieux serveur a dit que vous etes pas connecté, tant pis",
    es: "El glorioso servidor dijo que no estás conectado, que lástima",
  }),
  USERNAME_NOT_FOUND: (username) => ({
    en: `no account with username "${username}"`,
    fr: `pas de compte avec le pseudo "${username}"`,
    es: `No hay cuenta con el apodo "${username}"`,
  }),
  WELCOME_USERNAME: (username = "") => ({
    en: `welcome ${username}`,
    fr: `bienvenue ${username}`,
    es: `Bienvenido ${username}`,
  }),
  NOT_IN_DB: () => ({
    en: "You are not present in the db, got disconnected",
    fr: "Tu n'est pas présent dans la base de donnée, pouf déconnection :D",
    es: "No estás presente en la base de datos, te desconectó",
  }),
  GOODBYE: () => ({
    en: "We can't have you forever",
    fr: "Il faut savoir dire au revoir très cher",
    es: "Fue un placer",
  }),
  EXPECTED_FORMBODY: (method, url) => ({
    en: `Expected 'application/x-www-form-urlencoded' Content-Type for ${method} on ${url}.`,
    fr: `Content-Type 'application/x-www-form-urlencoded' attendu pour ${method} sur ${url}.`,
    es: `Se esperaba el Content-Type 'application/x-www-form-urlencoded' para ${method} en ${url}.`,
  }),
  EXPECTED_CONTENT_TYPE: (method) => ({
    en: `Content-Type not found in a ${method} request.`,
    fr: `Content-Type non trouvé pour une requète ${method}`,
    es: `No se encontró Content-Type en una ${method} solicitud`,
  }),
  ALPHANUMERIC_: (field) => ({
    en: `${field} can have only letters, digits and underscores`,
    fr: `le champ ${field} doit peut seulement avoir des lettres, chiffres et tirets du bas`,
    es: `El campo ${field} must solo puede tener letras, números y guiones bajos`,
  }),
  MAX_BYTE_LENGTH: (field, byteLength) => ({
    en: `${field} must be at most ${byteLength} bytes long`, 
    fr: `le champ ${field} doit faire maximum ${byteLength} octets`,
    es: `el campo ${field} debe tener un máximo de ${byteLength} octetos`,
  }),
  MAX_STR_LENGTH: (field, length) => ({
    en: `${field} must be at most ${length} chars long`,
    fr: `le champ ${field} doit faire maximum ${length} caractères`,
    es: `El campo ${field} debe tener un máximo de ${length} caracteres`,
  }),
  MIN_STR_LENGTH: (field, length) => ({
    en: `${field} must be at least ${length} chars long`, 
    fr: `le champ '${field}' doit faire au moins ${length} caractères`,
    es: `El campo '${field}' debe tener al menos ${length} caracteres`,
  }),
  MUST_BE_STR: (field) => ({
    en: `${field} must be a string`,
    fr: `le champ '${field}' doit etre une chaine de caractères`,
    es: `El campo '${field}' debe ser una cadena`,
  }),
  WRONG_PASSWORD: () => ({
    en: "wrong password",
    fr: "mauvais mot de passe",
    es: "mala contraseña",
  }),
  WRONG_USERNAME: () => ({
    en: "That's not your username",
    fr: "C'est pas ton pseudo",
    es: "No es tu apodo",
  }),
  LOST: () => ({
    en: "are you lost by any chance ?",
    fr: "Tu t'es perdu ?",
    es: "¿Estás perdido por alguna razón?",
  }),
  LOGIN: () => ({
    en: "login",
    fr: "connexion",
    es: "conexión",
  }),
  YOU: () => ({
    en: "You",
    fr: "Toi",
    es: "Tù",
  }),
  PONG_SOON: () => ({
    en: "Pong soon",
    fr: "Pong bentôt",
    es: "Pong pronto",
  }),
  BORING: () => ({
    en: "Boriiing",
    fr: "On s'ennuie...",
    es: "aburrido",
  }),
  NEED_ADMIN: () => ({
    en: "You need to be admin",
    fr: "tu dois etre admin",
    es: "Debes ser administrador",
  }),
};