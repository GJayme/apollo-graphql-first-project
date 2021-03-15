const { ApolloServer } = require("apollo-server");
const { createStore } = require("./utils");
const typeDefs = require("./schema");
const isEmail = require("isemail");

const resolvers = require("./resolvers");
const LaunchAPI = require("./datasources/launch");
require("dotenv").config();
const UserAPI = require("./datasources/user");

const store = createStore();

const server = new ApolloServer({
  context: async ({ req }) => {
    const auth = (req.headers && req.headers.authorization) || "";
    const email = Buffer.from(auth, "base64").toString("ascii");

    if (!isEmail.validate(email)) {
      return { user: null };
    }

    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;

    return { user: { ...user.dataValues } };
  },

  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/dev
  `);
});
