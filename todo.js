
const uuid = require('uuid');
const fs = require('./fs');

class TodoApplication {
  constructor(params) {
    this.users = {};
    this.items = {};
    this.lists = {};
  }

  async save() {
    await fs.write('./todo-data.dat', this.toString()); 
  }

  static async load() {
    return TodoApplication.fromString(await fs.read('./todo-data.dat'));
  }

  toString() {
    const containers = [this.users, this.items, this.lists];

    const data = containers.map(container => {
      const entities = Object.values(container);
      const data = entities.map(entity => entity.toString());
      return data;
    });

    return JSON.stringify(data);
  }

  static fromString(str) {
    const classes = [TodoUser, TodoListItem, TodoList];

    const data = JSON.parse(str);

    const [users, items, lists] = data.map((container, classIndex) => {
      const Class = classes[classIndex];
      const entityList = container.map(entityData => Class.fromString(entityData));
      const result = {};
      entityList.forEach(entity => {
        result[entity.id] = entity;
      });
      return result;
    });

    const app = new TodoApplication();

    app.users = users;
    app.items = items;
    app.lists = lists;

    return app;
  }

  static create() {
    return new TodoApplication({});
  }

  createList(name, owner) {
    const newList = TodoList.create(name, owner);
    this.lists[newList.id] = newList;

    return newList;
  }

  createItem(list, description, thumbnailImage) {
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
    const itemIds = list.getItemIds();
    return itemIds.map(itemId => this.items[itemId]);
  }

  updateItem(itemId, params) {
    const item = this.items[itemId];
    item.update(params);
  }

  removeItem(itemId) {
    const item = this.items[itemId];
    const list = this.lists[item.listId];
    
    list.removeItem(item);
    delete this.items[itemId];
  }

  removeList(listId) {
    const list = this.lists[listId];

    const itemIds = list.getItemIds();
    itemIds.forEach(id => this.removeItem(id));
    
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
    const { id, itemIds, name, owner, createdAt } = params;

    this.id = id;
    this.itemIds = itemIds;
    this.name = name;
    this.owner = owner;
    this.createdAt = createdAt
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      itemIds: this.itemIds,
      name: this.name,
      owner: this.owner,
      createdAt: this.createdAt,
    });
  }

  static fromString(str) {
    const obj = JSON.parse(str);

    return new TodoList(obj);
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
      itemIds: [],
      createdAt: Date.now(),
    });
  }

  addItem(item) {
    this.itemIds.push(item.id);
  }

  removeItem(item) {
    this.itemIds = this.itemIds.filter(itemId => itemId !== item.id);
  }

  getItemIds() {
    return this.itemIds;
  }
}

class TodoListItem {
  constructor(params) {
    const { id, listId, description, thumbnailImage } = params;
    
    this.id = id;
    this.listId = listId;
    this.description = description;
    this.thumbnailImage = thumbnailImage; // URI for thumbnail image
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      listId: this.listId,
      description: this.description,
      thumbnailImage: this.thumbnailImage,
    });
  }

  static fromString(str) {
    const obj = JSON.parse(str);

    return new TodoListItem(obj);
  }

  static create(list, description, thumbnailImage) {
    TodoListItem.validate({ list, description, thumbnailImage }, false);

    return new TodoListItem({
      id: uuid.v4(),
      listId: list.id,
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

  toString() {
    return JSON.stringify({
      id: this.id,
      username: this.username,
      password: this.password,
      image: this.image,
    });
  }

  static fromString(str) {
    const obj = JSON.parse(str);
    
    return new TodoUser(obj);
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

module.exports = {
  TodoApplication,
  TodoList,
  TodoListItem,
  TodoUser,
};
