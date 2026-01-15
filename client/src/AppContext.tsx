import { createContext, useContext } from "react";
import type { CategoryMeta, LeaderboardEntry, LobbyState, LobbySummary, ChatMessage } from "./lib/types";

export type GameStartedPayload = {
  lobbyId: string;
  roundId: string;
  category: string;
  clueBoard16: string[];
  visibleSecretForPlayer: boolean;
  secretIndexIfAllowed?: number;
};

export type VoteStatePayload = {
  lobbyId: string;
  votesByVoterId?: Record<string, string>;
  voteCountsByTargetId?: Record<string, number>;
  allSubmittedBoolean?: boolean;
  voteToStartCount?: number;
  voteToStartRequired?: number;
};

export type VoteRevealPayload = {
  lobbyId: string;
  fraudIds: string[];
  resultsSummary: {
    endedEarly: boolean;
    eliminatedPlayerId: string | null;
    fraudEliminated: boolean;
    summary: string;
  };
};

export type AppStore = {
  clientPlayerId: string;
  playerName: string | null;
  profileImage: string | null;
  categories: CategoryMeta[];
  lobbyList: LobbySummary[];
  lobbyState: LobbyState | null;
  gameStarted: GameStartedPayload | null;
  voteState: VoteStatePayload | null;
  voteReveal: VoteRevealPayload | null;
  chat: ChatMessage[];
  leaderboard: LeaderboardEntry[];
  lastError: { code: string; message: string } | null;
};

export type AppActions = {
  setPlayerName: (name: string) => void;
  setProfileImage: (profileImage: string | null) => void;
  clearChat: () => void;
};

export const AppContext = createContext<{ store: AppStore; actions: AppActions } | null>(null);

export function useApp() {
  const v = useContext(AppContext);
  if (!v) throw new Error("AppContext missing");
  return v;
}

