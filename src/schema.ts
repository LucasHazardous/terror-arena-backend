const typeDefs = `#graphql
    type User {
        id: ID!,
        username: String!,
        password: String!,
        roles: [String!]!,
        posts(page: Int!): [Post!]!
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
        post(id: ID!): Post,

        posts(page: Int!): [Post]
    }

    type Mutation {
        login(credentials: LoginInput): Session,

        createPost(post: PostInput!, session: SessionInput!): Post,
        deletePost(id: ID!, session: SessionInput!): ID
    }

    input PostInput {
        title: String! @constraint(minLength: 4, maxLength: 40),
        content: String! @constraint(minLength: 100, maxLength: 2000),,
        tags: [String!]! @constraint(pattern: "^[a-z]*$", minLength: 3, maxLength: 20)
    }

    input LoginInput {
        username: String! @constraint(pattern: "^[a-z]*$", minLength: 4, maxLength: 20),
        password: String! @constraint(pattern: "^[A-Za-z0-9]*$", minLength: 4, maxLength: 20)
    }

    input SessionInput {
        token: String! @constraint(minLength: 118, maxLength: 118)
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
