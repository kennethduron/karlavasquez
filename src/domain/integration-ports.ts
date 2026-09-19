export interface AuthPort {
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordRecovery(email: string): Promise<void>;
}

export interface DatabasePort {
  healthCheck(): Promise<boolean>;
}

export interface PrivateDocumentStoragePort {
  put(path: string, content: Uint8Array, contentType: string): Promise<void>;
  get(path: string): Promise<Uint8Array>;
  remove(path: string): Promise<void>;
}

export interface PublicMediaPort {
  delete(publicId: string): Promise<void>;
  getDeliveryUrl(publicId: string): string;
}

export interface PushNotificationPort {
  sendToDevice(token: string, title: string, body: string): Promise<void>;
}

export interface TransactionalEmailPort {
  send(message: { to: string; subject: string; text: string }): Promise<void>;
}

export interface BackupArchivePort {
  list(prefix?: string): Promise<readonly string[]>;
  put(path: string, encryptedContent: Uint8Array): Promise<void>;
}
