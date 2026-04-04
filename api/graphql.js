const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');
const quotes = require('../quotes.json');

const QuoteType = new GraphQLObjectType({
  name: 'Quote',
  fields: {
    id: { type: GraphQLInt },
    dialect: { type: GraphQLString },
    quote: { type: GraphQLString },
    english_translation: { type: GraphQLString },
    author: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    date_added: { type: GraphQLString },
    source: { type: GraphQLString }
  }
});

const StatsType = new GraphQLObjectType({
  name: 'Stats',
  fields: {
    total_quotes: { type: GraphQLInt },
    total_dialects: { type: GraphQLInt },
    dialects: { type: new GraphQLList(GraphQLString) }
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    quote: {
      type: QuoteType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve(parent, args) {
        return quotes.find(q => q.id === args.id);
      }
    },
    quotes: {
      type: new GraphQLList(QuoteType),
      args: { 
        dialect: { type: GraphQLString },
        tag: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve(parent, args) {
        let result = quotes;
        if (args.dialect) {
          result = result.filter(q => q.dialect.toLowerCase() === args.dialect.toLowerCase());
        }
        if (args.tag) {
          result = result.filter(q => q.tags && q.tags.some(t => t.toLowerCase() === args.tag.toLowerCase()));
        }
        if (args.offset) {
          result = result.slice(args.offset);
        }
        if (args.limit) {
          result = result.slice(0, args.limit);
        }
        return result;
      }
    },
    randomQuote: {
      type: QuoteType,
      args: {
        dialect: { type: GraphQLString }
      },
      resolve(parent, args) {
        let pool = quotes;
        if (args.dialect) {
          pool = pool.filter(q => q.dialect.toLowerCase() === args.dialect.toLowerCase());
        }
        return pool[Math.floor(Math.random() * pool.length)];
      }
    },
    search: {
      type: new GraphQLList(QuoteType),
      args: {
        q: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        const qLower = args.q.toLowerCase();
        return quotes.filter(quoteObj =>
          quoteObj.quote.toLowerCase().includes(qLower) ||
          quoteObj.english_translation.toLowerCase().includes(qLower) ||
          quoteObj.author.toLowerCase().includes(qLower) ||
          (quoteObj.tags && quoteObj.tags.some(tag => tag.toLowerCase().includes(qLower)))
        );
      }
    },
    qotd: {
      type: QuoteType,
      resolve() {
        const today = new Date().toISOString().split('T')[0];
        let seed = 0;
        for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
        return quotes[seed % quotes.length];
      }
    },
    stats: {
      type: StatsType,
      resolve() {
        const dialects = new Set(quotes.map(q => q.dialect));
        return {
          total_quotes: quotes.length,
          total_dialects: dialects.size,
          dialects: Array.from(dialects)
        };
      }
    },
    dialects: {
      type: new GraphQLList(GraphQLString),
      resolve() {
        return Array.from(new Set(quotes.map(q => q.dialect)));
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQuery
});

const router = express.Router();
router.all('/', createHandler({ schema }));

module.exports = router;
