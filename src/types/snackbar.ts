export type SnackBarMessageType = 'ERROR' | 'SUCCESS';

export interface NotifyMessageParams {
  message: string;
  messageType: SnackBarMessageType;
}

export type SnackBarContextType = {
  message: string | null;
  type: SnackBarMessageType | null;
  notify: (params: NotifyMessageParams) => void;
}