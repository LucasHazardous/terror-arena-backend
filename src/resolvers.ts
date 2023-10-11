import prisma from "./db";
import { IPost, ISession, IUser } from "./schema";

interface ILoginData {
    credentials: {
        username: string,
        password: string
    }
}

interface ISearchId {
    id: string
}

interface IDeleteId {
    id: string,
    token: string
}

interface IPostData {
    post: {
        title: string,
        content: string,
        tags: string[]
    },
    token: string
}

async function getToken(token: string): Promise<ISession | null> {
    return await prisma.session.findFirst({
        where: {
            token: token
        }
    });
}

export const resolvers = {
    Query: {
        async login(_: any, args: ILoginData) {
            const user = await prisma.user.findFirst({
                where: {
                    username: args.credentials.username,
                    password: args.credentials.password
                }
            });

            if(!user) return;
            
            const token = await Bun.password.hash(Date.now() + args.credentials.username);

            const session = await prisma.session.upsert({
                where: {
                    id: user.id
                },
                update: {
                    token
                },
                create: {
                    id: user.id,
                    token
                }
            });

            return session;
        },
        async post(_: any, args: ISearchId) {
            return await prisma.post.findFirst({
                where: {
                    id: args.id
                }
            });
        }
    },
    Mutation: {
        async createPost(_: any, args: IPostData) {
            const token = await getToken(args.token);

            if(!token) return;
            
            const user = await prisma.user.findFirst({
                where: {
                    id: token.id
                }
            });

            const createdPost = await prisma.post.create({
                data: {
                    authorId: user!.id,
                    ...args.post
                }
            });

            return createdPost;
        },
        async deletePost(_: any, args: IDeleteId): Promise<String | undefined> {
            const token = await getToken(args.token);

            if(!token) return;

            const post = await prisma.post.delete({
                where: {
                    id: args.id
                }
            });

            return post.id;
        }
    },
    Post: {
        async author(parent: IPost): Promise<IUser | null> {
            return await prisma.user.findFirst({
                where: {
                    id: parent.authorId
                }
            });
        }
    },
    User: {
        async posts(parent: IUser): Promise<IPost[] | null> {
            return await prisma.post.findMany({
                where: {
                    authorId: parent.id
                }
            });
        }
    }
};
