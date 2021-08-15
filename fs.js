const fs = require('fs/promises');

async function write(pathname, data) {
  const fd = await fs.open(pathname, 'w');
  await fs.writeFile(fd, Buffer.from(data));
  await fd.close();
}

async function read(pathname, data) {
  const fd = await fs.open(pathname, 'r');
  const buffer = await fs.readFile(fd);
  await fd.close();

  return buffer.toString();
}

module.exports = {
  write, read
};
