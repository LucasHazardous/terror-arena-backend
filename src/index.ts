import { ApolloServer } from "@apollo/server";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { depth_limit } from "./config";

import express, { json } from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [ depthLimit(depth_limit) ]
});

await server.start();

const app = express();
app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(server));
app.listen(4000);
