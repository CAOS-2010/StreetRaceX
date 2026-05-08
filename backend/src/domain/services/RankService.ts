// Domain Service: RankService
// Encapsulates the rank progression logic — pure business rules, no I/O

import { User, Rango, getNextRank } from '../entities/User';

export interface RankUpdateResult {
  newRango: Rango;
  newRetosConsecutivos: number;
  rankUpgraded: boolean;
}

export class RankService {
  /**
   * Applies the result of a completed challenge to the winner's rank stats.
   * Rule: 2 consecutive wins → rank up (auto), streak resets to 0 on rank up.
   */
  applyWin(user: User): RankUpdateResult {
    const newStreak = user.retos_consecutivos + 1;
    const WINS_TO_RANK_UP = 2;

    if (newStreak >= WINS_TO_RANK_UP) {
      const nextRank = getNextRank(user.rango);
      if (nextRank) {
        // Rank up!
        return {
          newRango: nextRank,
          newRetosConsecutivos: 0,
          rankUpgraded: true,
        };
      }
      // Already at S — stay, reset streak
      return {
        newRango: user.rango,
        newRetosConsecutivos: 0,
        rankUpgraded: false,
      };
    }

    return {
      newRango: user.rango,
      newRetosConsecutivos: newStreak,
      rankUpgraded: false,
    };
  }

  /**
   * Applies the result of a completed challenge to the loser's rank stats.
   * Rule: loss subtracts 1 from streak (min 0). No rank downgrade.
   */
  applyLoss(user: User): RankUpdateResult {
    const newStreak = Math.max(0, user.retos_consecutivos - 1);
    return {
      newRango: user.rango,
      newRetosConsecutivos: newStreak,
      rankUpgraded: false,
    };
  }
}
