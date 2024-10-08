import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import { InviteStatus } from "./invite-service";

describe("in-memory-invite-repository", () => {
  describe("given the details of an invite", () => {
    it("creates the invite", async () => {
      const inviteDetails = {
        inviter: "player1@email.com",
        invitee: "player2@email.com",
        exp: 1000,
        status: InviteStatus.PENDING,
      } satisfies InviteCreationDetails;

      const inMemoryInviteRepository = new InMemoryInviteRepository();
      const createdInvite =
        await inMemoryInviteRepository.create(inviteDetails);

      expect(createdInvite).toEqual({
        inviter: "player1@email.com",
        invitee: "player2@email.com",
        uuid: expect.toBeUUID(),
        exp: 1000,
        status: InviteStatus.PENDING,
      });
    });
  });
  describe("given the email of the invitee", () => {
    it("returns the associated invites where they have been invited", async () => {
      const inviteDetails = {
        inviter: "player1@email.com",
        invitee: "player2@email.com",
        exp: 1000,
        status: InviteStatus.PENDING,
      } satisfies InviteCreationDetails;

      const inMemoryInviteRepository = new InMemoryInviteRepository();
      await inMemoryInviteRepository.create(inviteDetails);
      await expect(
        inMemoryInviteRepository.loadInviteeInvites("player2@email.com"),
      ).resolves.toEqual([
        {
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          uuid: expect.toBeUUID(),
          exp: 1000,
          status: InviteStatus.PENDING,
        },
      ]);
    });
  });

  describe("retrieving an invite", () => {
    describe("given an invite", () => {
      it("returns details about the invite", async () => {
        const inviteDetails = {
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          exp: 1000,
          status: InviteStatus.PENDING,
        } satisfies InviteCreationDetails;

        const inMemoryInviteRepository = new InMemoryInviteRepository();
        const createdInvite =
          await inMemoryInviteRepository.create(inviteDetails);
        await expect(
          inMemoryInviteRepository.getInviteDetails(createdInvite.uuid),
        ).resolves.toEqual({
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          uuid: expect.toBeUUID(),
          exp: 1000,
          status: InviteStatus.PENDING,
        });
      });
    });
  });
  describe("deleting an invite", () => {
    describe("given an invite", () => {
      it("deletes the invite", async () => {
        const inviteDetails = {
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          exp: 1000,
          status: InviteStatus.PENDING,
        } satisfies InviteCreationDetails;

        const inMemoryInviteRepository = new InMemoryInviteRepository();
        const createdInvite =
          await inMemoryInviteRepository.create(inviteDetails);

        expect(
          await inMemoryInviteRepository.deleteInvite(createdInvite.uuid),
        ).toEqual({ isSuccess: true });
      });
      // TODO: Should we just mark invite as accepted rather than delete it?
    });
  });
  describe("accepting an invite", () => {
    describe("given an invite", () => {
      it("sets the invite status to accepted", async () => {
        const inviteDetails = {
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          exp: 1000,
          status: InviteStatus.PENDING,
        } satisfies InviteCreationDetails;

        const inMemoryInviteRepository = new InMemoryInviteRepository();
        const createdInvite =
          await inMemoryInviteRepository.create(inviteDetails);

        expect(
          await inMemoryInviteRepository.acceptInvite(createdInvite.uuid),
        ).toEqual({
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          exp: 1000,
          status: InviteStatus.ACCEPTED,
          uuid: expect.toBeUUID(),
        });

        expect(
          await inMemoryInviteRepository.getInviteDetails(createdInvite.uuid),
        ).toEqual({
          inviter: "player1@email.com",
          invitee: "player2@email.com",
          exp: 1000,
          status: InviteStatus.ACCEPTED,
          uuid: expect.toBeUUID(),
        });
      });
    });
  });
});
