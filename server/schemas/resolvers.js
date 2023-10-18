const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, _params, content) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate(savedBooks);
      }
      throw new AuthenticationError("Please log in");
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const password = await user.isCorrectPassword(password);

      if (!password) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return user;
      }
      throw new AuthenticationError("Please log in");
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return user;
      }
      throw new AuthenticationError("Please log in");
    },
  },
};
