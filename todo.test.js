const TodoApplication = require('./todo');

test('initializing todo application', () => {
  const application = TodoApplication.create();
});

test('simple Create and Remove scenario', () => {
  const app = TodoApplication.create();

  const jpham = app.createUser('jpham005', 'jpham004', '');

  const jphamList = app.createList('jpham todo list', jpham);

  const todo1 = app.createItem(jphamList.id, 'Do javascript TIL', '');
  const todo2 = app.createItem(jphamList.id, 'Do RainbowSix Siege', '');
  const todo3 = app.createItem(jphamList.id, 'DO WonShin', '');

  app.updateItem(todo2.id, {
    description: 'Do Tetris',
    thumbnailImage: '',
  });

  app.removeItem(todo2.id);

  app.removeList(jphamList.id);

  app.removeUser(jpham.id);
});
