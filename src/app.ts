import resolveRouters, { RouterType } from "@/resolve-routers";
import { KeyPairSet } from "@/user/user-router.d";
import validateUserSignupRequest from "@/user/validate-user-signup-request";
import express, { RequestHandler } from "express";
import { jwtDecrypt, KeyLike } from "jose";
import { Subject } from "rxjs";
import {
  createSocketServer,
  ExpressWithPortAndSocket,
} from "./create-server-side-web-socket";
import { InternalEventPublisher, Stage } from "./global";
import createInviteEventListener, {
  InviteCreatedEvent,
} from "./invite/create-invite-event-listener";
import createDispatchNotification from "./notification/create-dispatch-notification";

type AppFactoryParameters = {
  stage: Stage;
  keys: KeyPairSet;
  publishInternalEvent?: InternalEventPublisher<unknown, unknown>;
  internalEventSubscriber?: Subject<InviteCreatedEvent>;
};

const createAuthenticationMiddleware =
  (jwtPrivateKey: KeyLike): RequestHandler =>
  async (req, res, next) => {
    const authorizationField = req.headers.authorization;

    if (authorizationField) {
      try {
        const { payload } = await jwtDecrypt(
          authorizationField.split(" ")[1],
          jwtPrivateKey
        );
        // console.log(payload.userName);
        res.locals.claims = {
          email: payload.userName,
        };
      } catch (error) {}
    }

    next();
  };

export const appFactory = (
  {
    keys,
    stage,
    publishInternalEvent,
    internalEventSubscriber = new Subject(),
  }: AppFactoryParameters = {
    stage: "production",
    keys: {},
    publishInternalEvent: () => Promise.resolve(),
    internalEventSubscriber: new Subject(),
  }
) => {
  const app = express() as ExpressWithPortAndSocket;

  createSocketServer(app, {
    path: "/notification",
    privateKey: keys.jwtKeyPair.privateKey,
  });

  createInviteEventListener(
    internalEventSubscriber,
    createDispatchNotification(app.server)
  );

  const routers = resolveRouters({
    stage,
    keys,
    publishInternalEvent,
    authority: `localhost:${app.port}`,
  });

  app.use(express.json());
  app.use(createAuthenticationMiddleware(keys.jwtKeyPair.privateKey));
  app.use("/user", validateUserSignupRequest, routers[RouterType.userRouter]);
  app.use("/invite", routers[RouterType.inviteRouter]);
  app.use("/session", routers[RouterType.sessionRouter]);

  return app;
};
