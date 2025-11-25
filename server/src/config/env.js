import "dotenv/config"; // imports from file to setup global var

//require the .env
const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing Env Variable ${name} (check /server/.env)`);
  return v;
};

// defining something we can export
export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT ?? "3001", 10), //.env vars are stored as strings (10 is the numbering system)
  clientOrigin: required("CLIENT_ORIGIN"),

  //Define the configurations
  db: {
    host: required("DB_HOST"),
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    pass: required("DB_PASS"),
    connLimit: parseInt(process.env.DB_CONN_LIMIT ?? "10", 10),
    timezone: process.env.DB_TIMEZONE || "Z",
    charset: process.env.DB_CHARSET || "utf8mb4",
  },
  //Defining authentication
  session: {
    name: process.env.SESSION_COOKIE_NAME || "app_session",
    secret: required("SESSION_SECRET"),
    ttlHours: parseInt(process.env.SESSION_TTL_HOURS ?? "24", 10),
  },
};
