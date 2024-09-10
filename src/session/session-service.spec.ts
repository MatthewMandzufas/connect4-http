import { Uuid } from "@/global";
import { NoSuchSessionError } from "./errors";
import InMemorySessionRepository from "./in-memory-session-repository";
import SessionService from "./session-service";
import { SessionStatus } from "./types.d";

describe("session-service", () => {
  let sessionRepository: InMemorySessionRepository;
  let sessionService: SessionService;
  beforeEach(() => {
    sessionRepository = new InMemorySessionRepository();
    sessionService = new SessionService(sessionRepository);
  });

  describe("creating a session service", () => {
    describe("given a session repository", () => {
      it("creates a session service", () => {
        expect(sessionService).toBeInstanceOf(SessionService);
      });
    });
  });
  describe("creating a session", () => {
    describe("given the identities of two players", () => {
      it("creates an in-progress session", async () => {
        const sessionDetails = await sessionService.createSession({
          inviterUuid: "004be48d-d024-40b7-9b9e-e692adbd45ea",
          inviteeUuid: "53d13d08-6d6f-4d62-8753-52a91cc7b52e",
        });
        expect(sessionDetails).toEqual(
          expect.objectContaining({
            uuid: expect.toBeUUID(),
            inviter: expect.objectContaining({
              uuid: "004be48d-d024-40b7-9b9e-e692adbd45ea",
            }),
            invitee: expect.objectContaining({
              uuid: "53d13d08-6d6f-4d62-8753-52a91cc7b52e",
            }),
            status: "IN_PROGRESS",
          })
        );
      });
    });
  });
  describe("retrieving a session", () => {
    describe("given a session has been created", () => {
      describe("when provided with the id", () => {
        it("retrieves details about the session", async () => {
          const sessionDetails = await sessionService.createSession({
            inviterUuid: "6e07e2aa-f375-4020-838e-c3d7de8b79a6",
            inviteeUuid: "900821b2-fcec-414a-b1a6-02abbad7d35f",
          });

          const sessionId = sessionDetails.uuid;
          expect(sessionService.getSession(sessionId)).resolves.toEqual(
            expect.objectContaining({
              uuid: expect.toBeUUID(),
              inviter: {
                uuid: "6e07e2aa-f375-4020-838e-c3d7de8b79a6",
              },
              invitee: {
                uuid: "900821b2-fcec-414a-b1a6-02abbad7d35f",
              },
              status: SessionStatus.IN_PROGRESS,
            })
          );
        });
      });
    });
    describe("when provided with the uuid of a non-existent session", () => {
      it("throws a 'no such session' error", () => {
        const sessionUuid = "fakeNews" as Uuid;
        expect(sessionService.getSession(sessionUuid)).rejects.toThrow(
          new NoSuchSessionError()
        );
      });
    });
  });
  describe("adding games", () => {
    describe("given an in-progress session", () => {
      describe("with no games", () => {
        it("adds a new game to the session", async () => {
          const { uuid: sessionUuid } = await sessionService.createSession({
            inviterUuid: "70b9b52d-b993-4108-8719-8490878a3e35",
            inviteeUuid: "e5fef403-214c-46de-89be-655b90b9a79f",
          });

          expect(sessionService.getGameUuids(sessionUuid)).resolves.toEqual([]);
          expect(
            sessionService.getActiveGameId(sessionUuid)
          ).resolves.toBeUndefined();
          await sessionService.addNewGame();
          const activeGameId = await sessionService.getActiveGameId(
            sessionUuid
          );
          expect(activeGameId).toBeUUID();
          expect(sessionService.getGameUuids(sessionUuid)).resolves.toEqual([
            activeGameId,
          ]);
        });
      });
    });
  });
});
