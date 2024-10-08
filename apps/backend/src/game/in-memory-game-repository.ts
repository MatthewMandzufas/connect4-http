export default class InMemoryGameRepository implements GameRepository {
  #games: Map<Uuid, PersistedGameDetails>;
  constructor() {
    this.#games = new Map();
  }

  saveGame(gameDetails: GameDetails) {
    const gameUuid = crypto.randomUUID();
    const persistedGameDetails = { ...gameDetails, uuid: gameUuid };
    this.#games.set(gameUuid, persistedGameDetails);
    return Promise.resolve(persistedGameDetails);
  }

  async updateGame(gameUuid: Uuid, gameDetails: GameDetails) {
    this.#games.set(gameUuid, { ...gameDetails, uuid: gameUuid });
  }

  async loadGame(gameUuid: Uuid) {
    const persistedGameDetails = this.#games.get(gameUuid);
    return persistedGameDetails;
  }
}
