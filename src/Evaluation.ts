import { getParts } from "Creep";
import _ from "lodash";

export class Evaluation {
  public eligible: boolean = true;
  public score: number = 0;

  constructor(creep: Creep, parts: BodyPartConstant[]) {
    const partCounts = _.countBy(getParts(creep));
    for (const part in parts) {
      const count = partCounts[part];
      if (count === 0) {
        this.eligible = false;
        break;
      }
      this.score += count;
    }
  }
}
