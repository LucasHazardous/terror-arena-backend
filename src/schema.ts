const typeDefs = `#graphql
    type User {
        id: ID!,
        username: String!,
        password: String!,
        posts: [Post!]!
    }

    type Session {
        id: ID!,
        token: String!
    }

    type Post {
        id: ID!,
        title: String!,
        content: String!,
        tags: [String!]!,
        author: User!
    }

    type Query {
        login(credentials: LoginInput): Session,
        
        post(id: ID!): Post
    }

    type Mutation {
        createPost(post: PostInput!, token: String!): Post,
        deletePost(id: ID!, token: String!): ID
    }

    input PostInput {
        title: String!,
        content: String!,
        tags: [String!]!
    }

    input LoginInput {
        username: String!,
        password: String!
    }
`;

interface IUser {
    id: string,
    username: string,
    password: string
}

interface ISession {
    id: string,
    token: string
}

interface IPost {
    id: string,
    title: string,
    content: string,
    tags: string[],
    authorId: string
}

export {
    typeDefs,
    IUser,
    ISession,
    IPost
};
