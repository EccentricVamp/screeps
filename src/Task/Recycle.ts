import * as Act from "Act/Act";
import { moveTo, setStatus } from "Creep";
import { Task } from "./Task";

export const RECYCLE = 98;

export class Recycle implements Task {
  public acts: Act.Act[];
  public parts = [];

  public constructor(recycle: Act.Recycle) {
    this.acts = [recycle];
  }

  public perform(creep: Creep): void {
    setStatus(creep, RECYCLE);
    const act = this.acts[0];

    switch (act.execute(creep)) {
      case ERR_NOT_IN_RANGE:
        moveTo(creep, act.target);
        break;
      default:
        break;
    }
  }
}
