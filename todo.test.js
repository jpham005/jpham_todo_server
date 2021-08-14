const { TodoApplication, TodoUser } = require('./todo');

test('initializing todo application', () => {
  const application = TodoApplication.create();
});

test('simple Create and Remove scenario', () => {
  const app = TodoApplication.create();

  const jpham = app.createUser('jpham005', 'jpham004', '');

  const jphamList = app.createList('jpham todo list', jpham);

  const todo1 = app.createItem(jphamList, 'Do javascript TIL', '');
  const todo2 = app.createItem(jphamList, 'Do RainbowSix Siege', '');
  const todo3 = app.createItem(jphamList, 'DO WonShin', '');

  app.updateItem(todo2.id, {
    description: 'Do Tetris',
    thumbnailImage: '',
  });

  app.removeItem(todo2.id);

  app.removeList(jphamList.id);

  app.removeUser(jpham.id);
});

test('Stringify and Parse TodoUser', () => {
  const app = TodoApplication.create();
  
  const user = app.createUser('jpham', '005jpham', '');

  const str = user.toString();
  const rebuiltUser = TodoUser.fromString(str);
  
  expect(rebuiltUser.id).toBe(user.id);
  expect(rebuiltUser.username).toBe(user.username);
});

test('Stringify whole application, and restore it', async () => {
  const app = TodoApplication.create();

  const jpham = app.createUser('jpham005', 'jpham004', '');

  const jphamList = app.createList('jpham todo list', jpham);

  const todo1 = app.createItem(jphamList, 'Do javascript TIL', '');
  const todo2 = app.createItem(jphamList, 'Do RainbowSix Siege', '');
  const todo3 = app.createItem(jphamList, 'DO WonShin', '');

  await app.save();
  const app2 = await TodoApplication.load();

  app2.updateItem(todo2.id, {
    description: 'Do Tetris',
    thumbnailImage: '',
  });

  app2.removeItem(todo2.id);

  app2.removeList(jphamList.id);

  app2.removeUser(jpham.id);
});
