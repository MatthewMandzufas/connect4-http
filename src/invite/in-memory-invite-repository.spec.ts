import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import { InviteCreationDetails } from "./invite-repository";
import { InviteStatus } from "./invite-service.d";

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
      const createdInvite = await inMemoryInviteRepository.create(
        inviteDetails
      );

      expect(createdInvite).toEqual({
        inviter: "player1@email.com",
        invitee: "player2@email.com",
        uuid: expect.toBeUUID(),
        exp: 1000,
        status: InviteStatus.PENDING,
      });
    });
  });
});