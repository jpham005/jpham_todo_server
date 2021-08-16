const crypto = require('crypto');
const http = require('http');
const { TodoApplication } = require('./todo');

const serverSecret = 'jpham005';
const salt = 'jphamSaltySalt';

class Server {
  constructor(server) {
    const options = {};
    
    // request: http.IncomingMessage
    // response: http.ServerResponse
    const listener = (req, res) => {
      const { url, username, password, headers } = req;

      if (url === '/login')
        this.handleRequest(req, res, this.handleLogin.bind(this));
      else if (url === '/list')
        this.handleRequest(req, res, this.handleCreateList.bind(this));
      else if (url === '/item')
        this.handleRequest(req, res, this.handleCreateItem.bind(this));
      else {
        res.write('Not found error');
        res.end();
      }
    };

    this.server = http.createServer(listener);
    this.app = TodoApplication.create();
  }

  handleRequest(request, response, cb) {
    let data = '';
    request.on('data', chunk => {
      data += chunk;
    });
    request.on('end', () => {
      const user = this.getUserFromRequest(request);
      response.writeHead(200, {"content-type": "application/json"});
      cb(request, response, JSON.parse(data), user);
      response.end();
    });
  }

  static hashId(id) {
    return crypto.createHmac('sha256', serverSecret)
      .update(`${id}:${salt}`)
      .digest('hex');
  }

  listen(port) {
    this.server.listen(port);
  }

  writeJson(response, obj) {
    response.write(JSON.stringify(obj));
  }

  handleLogin(request, response, data) {
    const {username, password} = data;

    console.log('username:', username);
    console.log('password:', password);

    const user = this.app.findUser(username);
    if (user === undefined) return response.end();
    if (user.password !== password) return response.end();

    const hash = Server.hashId(user.id);
    const token = `${user.id}:${hash}`;

    response.write(token);
    response.end();
  }
  
  getUserFromRequest(request) {
    const { authorization } = request.headers;
    if (!authorization) return null;

    if (false === authorization.startsWith('Bearer ')) return null;
    
    const token = authorization.substr('Bearer '.length);
    const [userId, hash] = token.split(':');

    if (!userId || !hash) return null;

    if (hash !== Server.hashId(userId)) return null;

    return this.app.users[userId];
  }
  
  handleCreateList(request, response, data, user) {
    const { name } = data;

    if (typeof name !== 'string')
      return response.write('name is not present');

    if (user === null) 
      return response.write('Error: user is null');

    const newList = this.app.createList(name, user);

    return this.writeJson(response, newList);
  }

  handleCreateItem(request, response, data, user) {
    const { listId, description, image } = data;

    if (!listId) 
      return response.write('listId is not present');
    if (typeof description !== "string")
      return response.write('description is not present');
    if (typeof image !== "string")
      return response.write('image is not present');

    const list = this.app.lists[listId]
    if (list === undefined)
      return response.write('list does not exist');

    const newItem = this.app.createItem(list, description, image);
    return this.writeJson(response, newItem);
  }
}

function main() {
  const server = new Server();
  const port = Number(process.env.PORT || 8300);
  console.log(`Server started on PORT ${port}`);
  server.listen(port);
}

main();