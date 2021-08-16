const Server = require('./net');

function createDummyReqRes(token) {
  const result = {
    content: '',
  };
  const req = {
    headers: {},
  };
  const res = {
    write(str) {
      result.content += str;
    },
    end() {}
  };

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }   

  return [result, req, res];
}

test('Create user', () => {
  const server = new Server();

  const [result, req, res] = createDummyReqRes();

  const data = {
    username: 'testUser',
    password: 'testPassword',
    image: '',
  };

  server.handleCreateUser(req, res, data);

  const newUser = server.app.findUser('testUser');

  expect(result.content).toBe(JSON.stringify(newUser));
});

test('Create list', () => {
  const server = new Server();
  const user = server.app.createUser('testUser', 'testPassword', 'https://image.foo.com/bar');
  
  const [result, req, res] = createDummyReqRes();

  const data = {
    name: 'testList',
  };

  server.handleCreateList(req, res, data, user);

  const newList  = Object.values(server.app.lists).find(el => el.name === 'testList');

  expect(result.content).toBe(JSON.stringify(newList));
});

test('Create item', () => {
  const server = new Server();
  const user = server.app.createUser('testUser', 'testPassword', 'https://image.foo.com/bar');
  const list = server.app.createList('testList', user);

  const [result, req, res] = createDummyReqRes();
  const data = {
    listId: list.id,
    description: 'test description',
    image: 'https://image.foo.com/bar',
  };

  server.handleCreateItem(req, res, data, user);

  const newItem = Object.values(server.app.items).find(el => el.description === 'test description');

  expect(result.content).toBe(JSON.stringify(newItem));
});
