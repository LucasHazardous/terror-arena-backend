import prisma from "./db";
import { IPost, ISession, IUser, UserRole } from "./schema";

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

function hasAtLeastOneRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
}

export const resolvers = {
    Query: {
        async post(_: any, args: ISearchId) {
            return await prisma.post.findFirst({
                where: {
                    id: args.id
                }
            });
        }
    },
    Mutation: {
        async login(_: any, args: ILoginData) {
            console.log(args.credentials)
            const user = await prisma.user.findFirst({
                where: {
                    username: args.credentials.username
                }
            });

            if(!user || !Bun.password.verifySync(args.credentials.password, user.password)) return;
            
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
        async createPost(_: any, args: IPostData) {
            const token = await getToken(args.token);

            if(!token) return;
            
            const user = await prisma.user.findFirst({
                where: {
                    id: token.id
                }
            });

            if(!hasAtLeastOneRole(user!.roles, [UserRole.Admin, UserRole.Creator])) return;
            
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

            const user = await prisma.user.findFirst({
                where: {
                    id: token.id
                }
            });

            if(!hasAtLeastOneRole(user!.roles, [UserRole.Admin])) return;

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
