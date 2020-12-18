const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('./models/user');
const Word = require('./models/word');

const mongoDB = 'mongodb+srv://andrew:0HtgRnOk0oN44OOA@cluster0.b6tyh.mongodb.net/test?retryWrites=true&w=majority';
const connect = mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
connect.then((db) => {
  console.log('Connected correctly to server!');
}, (err) => {
  console.log(err);
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const typeDefs = `
  type Query {
    getUser(id: ID!): User
    getWord(id: ID!): Word
    getWords: [Word]
  }

  type Mutation {
    createUser(username: String! password: String!): User!
    updateUser(id: ID!, field: String!, value: String!): User!
    deleteUser(id: ID!): User
    createWord(createdBy: String! wordname: String!): Word!
    updateWord(id: ID!, field: String!, value: String!): Word!
    deleteWord(id: ID!): Word
  }

  type User {
    id: ID!
    username: String!
    password: String!
  }
  type Word {
    id: ID!
    createdBy: String!
    wordname: String!
  }
`

const DataLoader = require('dataloader');

const resolvers = {
  Query: {
    getUser: (parent, { id }) => User.findOne({_id: id}),
    getWord: (parent, { id }) => Word.findOne({_id: id}),
    getWords: (parent) => Word.find({}),
  },
  Word: {
    createdBy: async (parent) => {
      const userLoader = new DataLoader(async (keys) => {
        const result = await keys.map(key => User.findOne({_id: key}))
        return result;
      })
      const user = await userLoader.load(parent.createdBy);
      return user.username
    }
  },
  Mutation: {
    createUser: async (parent, { username, password }) => {
      const user = new User({
        username,
        password,
      });
      return user.save();
    },
    updateUser: (parent, { id, field, value }) => (
      User.findOneAndUpdate({ _id: id }, { [field]: value })
    ),
    deleteUser: (parent, { id }) => (
      User.findOneAndDelete({ _id: id })
    ),
    createWord: async (parent, { createdBy, wordname }) => {
      const word = new Word({
        createdBy,
        wordname
      });
      return word.save();
    },
    updateWord: (parent, { id, field, value }) => (
      Word.findOneAndUpdate({ _id: id }, { [field]: value })
    ),
    deleteWord: (parent, { id }) => (
      Word.findOneAndDelete({ _id: id })
    )
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );
