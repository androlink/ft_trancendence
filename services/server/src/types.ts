export type LanguageObject = [string, ...(string | LanguageObject)[]] | string;

export type Id = number | bigint;

export interface JwtUserPayload {
  id: Id;
  username?: string;
  admin?: number;
  password?: string;
  bio?: string;
  pfp?: string;
}

export type UserRow = {
  id: Id;
  username: string;
  admin: number;
  password: string;
  bio: string;
  pfp: string;
};
