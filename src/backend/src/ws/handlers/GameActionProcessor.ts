import { GameEvent, ServerEvent, UserEvent } from "@donk/shared";
import { AppContext, HandEvent, IdentifyableWebSocket } from "@donk/backend-core";
import UserAction from "../../models/UserAction";
import { ServerMessage } from "@donk/shared";

export class GameActionProcessor {
  constructor(private appContext: AppContext) {}

  async processAction(userAction: UserAction, wsc: IdentifyableWebSocket): Promise<void> {
    switch (userAction.type) {
      case UserEvent.Sit:
        await this.handleSit(wsc, userAction.value);
        break;

      case UserEvent.Stand:
        await this.handleStand(wsc, userAction.value);
        break;

      case UserEvent.BuyIn:
        await this.handleBuyIn(wsc, userAction.value);
        break;

      case UserEvent.Rename:
        await this.handleRename(wsc, userAction.value);
        break;

      case UserEvent.Ready:
        await this.handleReady(wsc);
        break;

      case UserEvent.Fold:
        await this.handleFold(wsc);
      default:
        console.log("Unexpected event");
    }
  }

  private async handleSit(wsc: IdentifyableWebSocket, location: string): Promise<void> {
    const seat = Number(location);
    await this.appContext.services.gameStateService.playerSits(wsc, seat);

    const changeDetails: ServerMessage = {
      type: ServerEvent.PlayerSat,
      update: { location, name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, changeDetails);
  }

  private async handleStand(wsc: IdentifyableWebSocket, location: string): Promise<void> {
    await this.appContext.services.gameStateService.playerStands(wsc);

    const changeDetails: ServerMessage = {
      type: ServerEvent.PlayerStood,
      update: { location, name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, changeDetails);
  }

  private async handleBuyIn(wsc: IdentifyableWebSocket, amount: string): Promise<void> {
    const { gameStateService, eventRelayService } = this.appContext.services;
    const buyIn = parseFloat(amount);
    await gameStateService.playerBuysIn(wsc, buyIn);

    const changeDetails: ServerMessage = {
      type: ServerEvent.PlayerBuyin,
      update: { name: wsc.name, amount },
    };

    await eventRelayService.publishGameEvent(wsc.gameId, changeDetails);
  }

  private async handleRename(wsc: IdentifyableWebSocket, newName: string): Promise<void> {
    const prevName = wsc.name;
    await this.appContext.services.gameStateService.playerRenames(wsc, newName);
    wsc.name = newName;

    const changeDetails: ServerMessage = {
      type: ServerEvent.Rename,
      update: { prevName, nextName: newName },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, changeDetails);
  }

  private async handleReady(wsc: IdentifyableWebSocket): Promise<void> {
    const { gameId } = wsc;
    const { eventRelayService, gameStateService } = this.appContext.services;

    await gameStateService.playerReady(wsc);

    const changeDetails: ServerMessage = {
      type: ServerEvent.Ready,
      update: { name: wsc.name },
    };

    await eventRelayService.publishGameEvent(gameId, changeDetails);

    if (await gameStateService.canStartPlay(gameId)) {
      await gameStateService.startPlay(gameId);

      const event = {
        action: GameEvent.StartHand,
        payload: JSON.stringify({ gameId }),
      } as HandEvent;

      await eventRelayService.publishHandEvent(event);
    }
  }

  private async handleFold(wsc: IdentifyableWebSocket): Promise<void> {
    const { id, gameId } = wsc;
    const { eventRelayService } = this.appContext.services;

    const event = {
      action: GameEvent.Fold,
      payload: JSON.stringify({ gameId, playerId: id }),
    } as HandEvent;

    await eventRelayService.publishHandEvent(event);
  }
}
