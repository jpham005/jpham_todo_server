const Server = require('./net');

function main() {
  const server = new Server();
  const port = Number(process.env.PORT || 8300);
  console.log(`Server started on PORT ${port}`);
  server.listen(port);
}

main();