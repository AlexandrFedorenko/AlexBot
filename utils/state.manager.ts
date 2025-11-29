import { UserState } from '../types';

class StateManager {
  private states: Record<number, UserState> = {};

  /**
   * Get user state
   */
  getUserState(userId: number): UserState {
    return this.states[userId] || {};
  }

  /**
   * Set user state
   */
  setUserState(userId: number, state: UserState): void {
    this.states[userId] = { ...this.states[userId], ...state };
  }

  /**
   * Reset user state
   */
  resetUserState(userId: number): void {
    this.states[userId] = {};
  }

  /**
   * Update user state property
   */
  updateUserState(userId: number, updates: Partial<UserState>): void {
    this.states[userId] = { ...this.getUserState(userId), ...updates };
  }
}

export const stateManager = new StateManager();

