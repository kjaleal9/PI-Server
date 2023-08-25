const sql = require("mssql");

const config = {
  user: "TPMDB",
  password: "TPMDB",
  server: "localhost", // You can use 'localhost\\instance' to connect to named instance
  database: "TPMDB",
  stream: false,
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 60000,
  },
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

let appPool;

async function createConnectionPool() {
  try {
    appPool = new sql.ConnectionPool(config);

    if (appPool instanceof sql.ConnectionPool) {
      console.log("Connection Pool created successfully");
    } else {
      console.log("Failed to create connection pool");
    }
  } catch (err) {
    console.error("Error creating Connection Pool", err);
  }
}
async function closeConnectionPool() {
  try {
    await appPool.close();

    if (appPool.connected) {
      console.log("Connection Pool is still open");
    } else {
      console.log("Connection pool closed");
    }
  } catch (err) {
    console.error("Error closing Connection Pool", err);
  }
}

const databaseMiddleware = async (req, res, next) => {
  appPool.connect().then(async (pool) => {
    req.db = pool;
    next();
    console.log(req.db.available, req.db.borrowed, req.db.pending, req.db.size);
  });
};

module.exports = {
  appPool,
  databaseMiddleware,
  createConnectionPool,
  config,
  closeConnectionPool,
};
