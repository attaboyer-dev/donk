import { AppContext } from "@donk/backend-core";
import { GameEvent, ServerEvent, ServerMessage } from "@donk/shared";

export class HandActionProcessor {
  private appCtx: AppContext;
  constructor(private appContext: AppContext) {
    this.appCtx = appContext;
  }

  // TODO: Split "dealer" actions with hand actions?
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
      case GameEvent.EndHand:
        // TODO:
        break;

      default:
        console.log("Unexpected event");
    }
  }

  private async handleStartHand(payload: any) {
    const { eventRelayService, gameStateService } = this.appCtx.services;
    const { gameId } = payload;

    await gameStateService.beginHand(gameId);
    const notification: ServerMessage = {
      type: ServerEvent.HandStarted,
      update: {},
    };
    await eventRelayService.publishGameEvent(gameId, notification);

    await this.delay(3000);

    await gameStateService.adjustButton(gameId);
    const buttonNotification: ServerMessage = {
      type: ServerEvent.ButtonMoved,
      update: {},
    };
    await eventRelayService.publishGameEvent(gameId, buttonNotification);

    await this.delay(3000);

    await gameStateService.postBlinds(gameId);
    await gameStateService.dealCards(gameId);
    const blindsNotification: ServerMessage = {
      type: ServerEvent.BlindsPosted,
      update: {},
    };
    await eventRelayService.publishGameEvent(gameId, blindsNotification);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
