import { neon } from "@neondatabase/serverless";

const NullishQueryFunction = () => {
  throw new Error(
    "No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set",
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    "No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set",
  );
};

// Force fresh connections by adding cache buster to connection string
const createFreshConnection = () => {
  if (!process.env.DATABASE_URL) return NullishQueryFunction;

  const baseUrl = process.env.DATABASE_URL;
  const separator = baseUrl.includes("?") ? "&" : "?";
  const cacheBuster = `${separator}_cb=${Date.now()}`;

  return neon(baseUrl + cacheBuster);
};

const sql = createFreshConnection();

export default sql;
