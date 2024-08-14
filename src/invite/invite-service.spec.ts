import InMemoryUserRepositoryFactory from "@/user/in-memory-user-repository";
import UserService from "@/user/user-service";
import createInviteEventHandlers from "./create-invite-event-handler";
import InMemoryInviteRepository from "./in-memory-invite-repository";
import InviteService, { InvalidInvitationError } from "./invite-service";
import {
  InviteEvents,
  InviteServiceEventHandler,
  InviteStatus,
} from "./invite-service.d";

const createUserServiceWithInviterAndInvitee = async () => {
  const userRepository = new InMemoryUserRepositoryFactory();
  const userService = new UserService(userRepository);
  const inviterUserDetails = {
    firstName: "Player",
    lastName: "1",
    email: "player1@email.com",
    password: "awejoajseojase",
  };

  const inviteeUserDetails = {
    firstName: "Player",
    lastName: "2",
    email: "player2@email.com",
    password: "aksjdnlksdlkasd",
  };
  await userService.create(inviterUserDetails);
  await userService.create(inviteeUserDetails);
  const inviteRepository = new InMemoryInviteRepository();
  const inviteService = new InviteService(
    userService,
    inviteRepository,
    createInviteEventHandlers(() => Promise.resolve())
  );
  return inviteService;
};

describe("invite-service", () => {
  const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
  describe("given an inviter who is an existing user", () => {
    describe("and an invitee who is an existing user", () => {
      it("creates an invite", async () => {
        jest.useFakeTimers({ doNotFake: ["setImmediate"] });
        const currentTime = Date.now();
        jest.setSystemTime(currentTime);

        const inviteService = await createUserServiceWithInviterAndInvitee();

        const inviteDetails = await inviteService.create({
          invitee: "player2@email.com",
          inviter: "player1@email.com",
        });

        expect(inviteDetails).toEqual({
          uuid: expect.toBeUUID(),
          exp: currentTime + lengthOfDayInMilliseconds,
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          status: InviteStatus.PENDING,
        });
      });
      describe("and the service was created with an invitation created callback", () => {
        it("calls the callback with the details of the created invitation", async () => {
          expect.assertions(1);
          const mockedInvitationCreationCallback = jest.fn();
          const userRepository = new InMemoryUserRepositoryFactory();
          const userService = new UserService(userRepository);
          const inviteRepository = new InMemoryInviteRepository();

          const inviteService = new InviteService(
            userService,
            inviteRepository,
            {
              [InviteEvents.INVITATION_CREATED]:
                mockedInvitationCreationCallback as InviteServiceEventHandler,
            }
          );
          await userRepository.create({
            firstName: "1",
            lastName: "name",
            email: "player1@email.com",
            password: "somethingGreat",
          });
          await userRepository.create({
            firstName: "2",
            lastName: "name",
            email: "player2@email.com",
            password: "somethingGreat",
          });
          await inviteService.create({
            invitee: "player2@email.com",
            inviter: "player1@email.com",
          });
          expect(mockedInvitationCreationCallback).toHaveBeenCalledWith({
            inviter: "player1@email.com",
            invitee: "player2@email.com",
            exp: expect.any(Number),
            status: InviteStatus.PENDING,
            uuid: expect.toBeUUID(),
          });
        });
      });
      describe("and an existing invite", () => {
        it("retrieves an invite", async () => {
          jest.useFakeTimers({ doNotFake: ["setImmediate"] });
          const currentTime = Date.now();
          jest.setSystemTime(currentTime);

          const inviteService = await createUserServiceWithInviterAndInvitee();

          await inviteService.create({
            invitee: "player2@email.com",
            inviter: "player1@email.com",
          });
          await expect(
            inviteService.getInvitesReceivedByUser("player2@email.com")
          ).resolves.toEqual([
            {
              uuid: expect.toBeUUID(),
              inviter: "player1@email.com",
              invitee: "player2@email.com",
              exp: currentTime + lengthOfDayInMilliseconds,
              status: InviteStatus.PENDING,
            },
          ]);
        });
      });
    });
    describe("and the invitee is the inviter", () => {
      it("it throws an 'InvalidInvitation' error", async () => {
        const inviteService = await createUserServiceWithInviterAndInvitee();
        expect(
          inviteService.create({
            invitee: "player1@email.com",
            inviter: "player1@email.com",
          })
        ).rejects.toThrow(
          new InvalidInvitationError("Users cannot send invites to themselves")
        );
      });
    });
    describe("and the invitee is not an existing user", () => {
      it("throws an 'InvalidInvitation' error", async () => {
        const inviteService = await createUserServiceWithInviterAndInvitee();

        expect(
          inviteService.create({
            invitee: "player9@email.com",
            inviter: "player1@email.com",
          })
        ).rejects.toThrow(new InvalidInvitationError("Invitee does not exist"));
      });
    });
  });
});
