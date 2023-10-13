const typeDefs = `#graphql
    type User {
        id: ID!,
        username: String!,
        password: String!,
        roles: [String!]!,
        posts(page: Int!): [Post!]!,
        comments(page: Int!): [Comment!]!
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
        author: User!,
        comments(page: Int!): [Comment!]!
    }

    type Comment {
        id: ID!,
        content: String!,
        author: User!
    }

    type Query {
        post(id: ID!): Post,

        posts(page: Int!): [Post],

        comments(postId: ID!, page: Int!): [Comment]
    }

    type Mutation {
        login(credentials: LoginInput): Session,

        createPost(post: PostInput!, session: SessionInput!): Post,
        deletePost(id: ID!, session: SessionInput!): ID,

        createComment(comment: CommentInput!, session: SessionInput!): Comment
    }

    input PostInput {
        title: String! @constraint(minLength: 4, maxLength: 40),
        content: String! @constraint(minLength: 100, maxLength: 2000),
        tags: [String!]! @constraint(pattern: "^[a-z]*$", minLength: 3, maxLength: 20)
    }

    input LoginInput {
        username: String! @constraint(pattern: "^[a-z]*$", minLength: 4, maxLength: 20),
        password: String! @constraint(pattern: "^[A-Za-z0-9]*$", minLength: 4, maxLength: 20)
    }

    input SessionInput {
        token: String! @constraint(minLength: 118, maxLength: 118)
    }

    input CommentInput {
        content: String! @constraint(minLength: 20, maxLength: 500),
        postId: ID!
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

interface IComment {
    id: string,
    content: string,
    authorId: string,
    postId: string
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
    IComment,
    UserRole
};
