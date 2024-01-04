import { ACTION } from '../enums/action.enum';

export function isPlayAction(action: ACTION): boolean {
  return action === ACTION.PLAY;
}
