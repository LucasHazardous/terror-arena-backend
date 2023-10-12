const typeDefs = `#graphql
    type User {
        id: ID!,
        username: String!,
        password: String!,
        roles: [String!]!,
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
        post(id: ID!): Post
    }

    type Mutation {
        login(credentials: LoginInput): Session,

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
    roles: string[],
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

enum UserRole {
    Admin = "admin",
    Creator = "creator",
    Commentator = "commentator"
}

export {
    typeDefs,
    IUser,
    ISession,
    IPost,
    UserRole
};
