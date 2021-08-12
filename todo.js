
const uuid = require('uuid');

class TodoApplication {
  constructor(params) {
    this.users = {};
    this.items = {};
    this.lists = {};
  }

  static create() {
    return new TodoApplication({});
  }

  createList(name, owner) {
    const newList = TodoList.create(name, owner);
    this.lists[newList.id] = newList;

    return newList;
  }

  createItem(listId, description, thumbnailImage) {
    const list = this.lists[listId];
    const item = TodoListItem.create(list, description, thumbnailImage);

    this.items[item.id] = item;
    list.addItem(item);

    return item;
  }

  createUser(username, password, image) {
    if (this.findUser(username) !== undefined) {
      throw Error('username is already occupied');
    }

    const newUser = TodoUser.create(username, password, image);
    this.users[newUser.id] = newUser;

    return newUser;
  }

  findUser(username) {
    return Object.values(this.users).find(el => el === username);
  }

  getListsByOwnerId(userId) {
    return Object.values(this.lists)
      .filter(list => list.owner.id === userId);
  }

  getItemsByListId(listId) {
    const list = this.lists[listId];
    return list.getItems();
  }

  updateItem(itemId, params) {
    const item = this.items[itemId];
    item.update(params);
  }

  removeItem(itemId) {
    const item = this.items[itemId];
    const list = item.list;
    
    delete list.items[itemId];
    delete this.items[itemId];
  }

  removeList(listId) {
    const list = this.lists[listId];

    const items = list.getItems();
    items.forEach(el => this.removeItem(el.id));
    
    delete this.lists[listId];
  }

  removeUser(userId) {
    const lists = this.getListsByOwnerId(userId);
    lists.forEach(el => this.removeList(el.id));

    delete this.users[userId];
  }
}

class TodoList {
  constructor(params) {
    const { id, name, owner, createdAt } = params;

    this.id = id;
    this.items = {};
    this.name = name;
    this.owner = owner;
    this.createdAt = createdAt
  }

  static create(name, owner) {
    if (typeof name !== 'string') {
      throw Error('name must be string');
    }

    if (false === owner instanceof TodoUser) {
      throw Error('owner must be TodoUser');
    }

    if (name.length < 1 || name.length > 20) {
      throw Error('the length of name must satisfy 1 <= len <= 20');
    }

    return new TodoList({
      id: uuid.v4(),
      name,
      owner,
      createdAt: Date.now(),
    });
  }

  addItem(item) {
    this.items[item.id] = item;
  }

  getItems() {
    return Object.values(this.items);
  }
}

class TodoListItem {
  constructor(params) {
    const { id, list, description, thumbnailImage } = params;
    
    this.id = id;
    this.list = list
    this.description = description;
    this.thumbnailImage = thumbnailImage; // URI for thumbnail image
  }

  static create(list, description, thumbnailImage) {
    TodoListItem.validate({ list, description, thumbnailImage }, false);

    return new TodoListItem({
      id: uuid.v4(),
      list,
      description,
      thumbnailImage,
    });
  }

  static validate(params, updating) {
    const { list, description, thumbnailImage } = params;

    if (typeof description !== 'string') {
      throw Error('description must be string');
    }

    if (typeof thumbnailImage !== 'string') {
      throw Error('thumbnailImage url must be string');
    }

    if (description.length < 1) {
      throw Error('description is empty');
    }

    if (false == updating) {
      if (false === list instanceof TodoList) {
        throw Error('list must be instance of TodoList');
      }
    }
  }

  update(params) {
    TodoListItem.validate(params, true);

    const { description, thumbnailImage } = params;

    this.description = description;
    this.thumbnailImage = thumbnailImage;
  }
}

class TodoUser {
  constructor(params) {
    const { id, username, password, image } = params;

    this.id = id;
    this.username = username;
    this.password = password;
    this.image = image;
  }

  static create(username, password, image) {
    if (typeof username !== 'string') {
      throw Error('username must be string');
    }

    if (typeof password !== 'string') {
      throw Error('password must be string');
    }

    if (typeof image !== 'string') {
      throw Error('image must be string');
    }

    if (username.length < 1 || username.length > 20) {
      throw Error('the length of username must satisfy 1 <= len <= 20');
    }

    if (password.length < 4) {
      throw Error('password is too short');
    }

    return new TodoUser({
      id: uuid.v4(),
      username,
      password,
      image,
    });
  }
}

module.exports = TodoApplication;
