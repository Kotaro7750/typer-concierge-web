import { EnqueueSnackbar } from "notistack";

export type NotificationSeverity = 'success' | 'warning' | 'error';

export type NotificationRegisterer = (title: string, message: string) => void;
export type NotificationRegistererMap = Map<NotificationSeverity, NotificationRegisterer>;

export function useNotification(enqueueSnackbar: EnqueueSnackbar): NotificationRegistererMap {
  const register = (title: string, message: string, severity: NotificationSeverity) => {
    enqueueSnackbar(`${title}: ${message}`, { variant: severity });
  };

  const registererMap: NotificationRegistererMap = new Map(
    [
      ['success', (title: string, message: string) => register(title, message, 'success')],
      ['warning', (title: string, message: string) => register(title, message, 'warning')],
      ['error', (title: string, message: string) => register(title, message, 'error')],
    ]
  );

  return registererMap;
}

