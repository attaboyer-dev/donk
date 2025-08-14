import { AppContext } from "@donk/backend-core";
import { GameEvent, ServerEvent, ServerMessage } from "@donk/shared";

export class HandActionProcessor {
  private appCtx: AppContext;
  constructor(private appContext: AppContext) {
    this.appCtx = appContext;
  }

  async processAction(event: GameEvent, payload: any): Promise<void> {
    switch (event) {
      case GameEvent.StartHand:
        await this.handleStartHand(payload);
      case GameEvent.Fold:
        // TODO: Gameplay action
        break;

      case GameEvent.Check:
        // TODO: Gameplay action
        break;

      case GameEvent.Call:
        // TODO: Gameplay action
        break;

      case GameEvent.Raise:
        // TODO: Gameplay action
        break;

      case GameEvent.Show:
        // TODO: Gameplay action
        break;

      default:
        console.log("Unexpected event");
    }
  }

  private async handleStartHand(payload: any) {
    const { eventRelayService, gameStateService } = this.appCtx.services;
    const { gameId } = payload;
    await gameStateService.beginHand(gameId);
    const startHandDetails: ServerMessage = {
      type: ServerEvent.HandStarted,
      update: {},
    };
    await eventRelayService.publishGameEvent(gameId, startHandDetails);
    await gameStateService.adjustButton(gameId);
    // await gameStateService.postBlinds(gameId);
    // await gameStateService.dealCard()

    // Start hand, assign (or rotate) button, post blinds, deal cards
    // To assign the button, I need to know the players, and previous seat that was button.
  }
}
