const http = require("http");
const app = require("./app");

const { createConnectionPool } = require("./sql");

const server = http.createServer(app);

async function startServer() {
  await createConnectionPool();

  server.listen(process.env.PORT || 5000, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
  });
}

startServer();
