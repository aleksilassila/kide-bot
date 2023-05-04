import { Prisma, Token, User } from "@prisma/client";
import { getToken } from "../kide-api/get-token";
import { getKideUser } from "../kide-api/get-kide-user";
import prisma from "../prisma";
import { client } from "../app";

export type UserWithToken = Prisma.UserGetPayload<{
  include: {
    token: true;
  };
}>;

const User = {
  createOrUpdate: async function (
    username: string,
    password: string,
    discordUserId: string
  ): Promise<User | undefined> {
    const tokenResponse = await getToken(username, password);

    if (!tokenResponse?.access_token) {
      return;
    }

    const kideUser = await getKideUser(tokenResponse.access_token);

    if (!kideUser) return;

    return await prisma.user
      .upsert({
        where: {
          discordId: discordUserId,
        },
        update: {
          discordId: discordUserId,
          id: kideUser.id,
          email: kideUser.email,
          fullName: kideUser.fullName,
          password: password,
          token: {
            update: {
              token: tokenResponse.access_token,
              expiresAt: new Date(Date.now() + tokenResponse.expires_in),
            },
          },
        },
        create: {
          discordId: discordUserId,
          id: kideUser.id,
          email: kideUser.email,
          fullName: kideUser.fullName,
          password: password,
          token: {
            create: {
              token: tokenResponse.access_token,
              expiresAt: new Date(Date.now() + tokenResponse.expires_in),
            },
          },
        },
      })
      .catch((err) => undefined);
  },

  refreshToken: async function (user: User): Promise<Token | undefined> {
    const tokenResponse = await getToken(user.email, user.password);

    if (!tokenResponse?.access_token) {
      return;
    }

    return await prisma.token
      .update({
        where: {
          userId: user.id,
        },
        data: {
          token: tokenResponse.access_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in),
        },
      })
      .catch((err) => undefined);
  },

  sendDirectMessage: async function (user: User, message: string) {
    const dcUser = await client.users
      .fetch(user.discordId)
      .catch((err) => undefined);

    dcUser?.send(message).catch(console.error);
  },

  destroy: async function (user: User) {
    return await prisma.user
      .delete({
        where: {
          id: user.id,
        },
      })
      .catch(console.error);
  },
};

export default User;
