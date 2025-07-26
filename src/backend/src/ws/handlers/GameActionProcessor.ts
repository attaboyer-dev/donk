import { IdentifyableWebSocket } from "../../types/IdentifyableWebSocket";
import UserAction from "../../models/UserAction";
import { ServerAction } from "../../models/ServerAction";
import { ServerEvent, UserEvent } from "src/shared/src";
import { AppContext } from "../../types/AppContext";

export class GameActionProcessor {
  constructor(private appContext: AppContext) {}

  async processAction(userAction: UserAction, wsc: IdentifyableWebSocket): Promise<void> {
    switch (userAction.type) {
      case UserEvent.Fold:
        // TODO: Gameplay action
        break;

      case UserEvent.Check:
        // TODO: Gameplay action
        break;

      case UserEvent.Call:
        // TODO: Gameplay action
        break;

      case UserEvent.Raise:
        // TODO: Gameplay action
        break;

      case UserEvent.Show:
        // TODO: Gameplay action
        break;

      case UserEvent.Sit:
        await this.handleSit(wsc, userAction.value);
        break;

      case UserEvent.Stand:
        await this.handleStand(wsc, userAction.value);
        break;

      case UserEvent.BuyIn:
        await this.handleBuyIn(wsc, userAction.value);
        break;

      case UserEvent.Leave:
        // TODO: Participation action
        break;

      case UserEvent.Join:
        // TODO: Participation action
        break;

      case UserEvent.Rename:
        await this.handleRename(wsc, userAction.value);
        break;

      case UserEvent.Ready:
        await this.handleReady(wsc);
        break;

      default:
        console.log("Unexpected event");
    }
  }

  private async handleSit(wsc: IdentifyableWebSocket, location: string): Promise<void> {
    const seat = Number(location);
    await this.appContext.services.gameStateService.playerSits(wsc, seat);

    const tableDetails: ServerAction = {
      type: ServerEvent.PlayerSat,
      update: { location, name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, tableDetails);
  }

  private async handleStand(wsc: IdentifyableWebSocket, location: string): Promise<void> {
    // TODO: Validate player can STAND, THEN
    await this.appContext.services.gameStateService.playerStands(wsc);

    const tableDetails: ServerAction = {
      type: ServerEvent.PlayerStood,
      update: { location, name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, tableDetails);
  }

  private async handleBuyIn(wsc: IdentifyableWebSocket, amount: string): Promise<void> {
    //TODO: Validation
    const buyIn = parseFloat(amount);
    await this.appContext.services.gameStateService.playerBuysIn(wsc, buyIn);

    const tableDetails: ServerAction = {
      type: ServerEvent.PlayerBuyin,
      update: { name: wsc.name, amount },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, tableDetails);
  }

  private async handleRename(wsc: IdentifyableWebSocket, newName: string): Promise<void> {
    // TODO: Must be unique
    // TODO: Participation action
    const prevName = wsc.name;
    await this.appContext.services.gameStateService.playerRenames(wsc, newName);
    wsc.name = newName;

    const tableDetails: ServerAction = {
      type: ServerEvent.Rename,
      update: { prevName, nextName: newName },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, tableDetails);
  }

  private async handleReady(wsc: IdentifyableWebSocket): Promise<void> {
    // TODO: Validation on whether a player can be ready
    await this.appContext.services.gameStateService.playerReady(wsc);

    const tableDetails: ServerAction = {
      type: ServerEvent.Ready,
      update: { name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, tableDetails);
    // TODO: If 3+ players, and all the players sitting are ready start the game!
  }
}
