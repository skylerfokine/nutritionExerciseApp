//file to manage our db connections through pooling
//if you're my teammates you can read this : en.wikipedia.org/wiki/Connection_pool

import mysql from "mysql2/promise";
import { config } from "../config/env.js";

export const pool = await mysql.create;
