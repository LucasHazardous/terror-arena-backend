import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

import express, { json } from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [ depthLimit(5) ]
});

await server.start();

const app = express();
app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(server));
app.listen(4000);

// const { url } = await startStandaloneServer(server, {
//     listen: {
//         port: 4000
//     }
// });

// console.log(url);
