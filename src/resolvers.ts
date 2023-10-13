import { page_limit } from "./config";
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
    session: {
        token: string
    }
}

interface IPostData {
    post: {
        title: string,
        content: string,
        tags: string[]
    },
    session: {
        token: string
    }
}

interface ICommentData {
    comment: {
        postId: string,
        content: string
    },
    session: {
        token: string
    }
}

interface IPagination {
    page: number
}

export const resolvers = {
    Query: {
        async post(_: any, args: ISearchId) {
            return await prisma.post.findFirst({
                where: {
                    id: args.id
                }
            });
        },
        async posts(_: any, args: IPagination) {
            if (Number(args.page) < 0) return;

            return await prisma.post.findMany({
                orderBy: {
                    id: "desc"
                },
                skip: args.page * page_limit,
                take: page_limit
            });
        }
    },
    Mutation: {
        async login(_: any, args: ILoginData) {
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
            const user = await getUserWithRoles(
                args.session.token, 
                [UserRole.Creator, UserRole.Admin]
            );

            if(!user) return;
            
            const createdPost = await prisma.post.create({
                data: {
                    authorId: user!.id,
                    ...args.post
                }
            });

            return createdPost;
        },
        async deletePost(_: any, args: IDeleteId): Promise<String | undefined> {
            const user = await getUserWithRoles(
                args.session.token, 
                [UserRole.Admin]
            );

            if(!user) return;

            const post = await prisma.post.delete({
                where: {
                    id: args.id
                }
            });

            return post.id;
        },
        async createComment(_: any, args: ICommentData) {
            const user = await getUserWithRoles(
                args.session.token, 
                [UserRole.Commentator, UserRole.Admin]
            );

            if(!user) return;

            const comment = await prisma.comment.create({
                data: {
                    ...args.comment,
                    authorId: user!.id
                }
            });

            return comment;
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
        async posts(parent: IUser, args: IPagination): Promise<IPost[] | null> {
            return await prisma.post.findMany({
                where: {
                    authorId: parent.id
                },
                orderBy: {
                    id: "desc"
                },
                skip: args.page * page_limit,
                take: page_limit
            });
        }
    }
};

async function getUserWithRoles(token: string, roles: UserRole[]): Promise<IUser | undefined> {
    const tokenObject = await getToken(token);

    if(!tokenObject) return;

    const user = await prisma.user.findFirst({
        where: {
            id: tokenObject.id
        }
    });

    if(!hasAtLeastOneRole(user!.roles, roles)) return;

    return user!;
}

function hasAtLeastOneRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
}

async function getToken(token: string): Promise<ISession | null> {
    return await prisma.session.findFirst({
        where: {
            token: token
        }
    });
}
