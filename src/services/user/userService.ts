const DELETED_USERS_STORAGE_KEY = 'zenia_deleted_user_identifiers';
const USERS_UPDATED_EVENT = 'zenia_users_deleted_updated';

class UserServiceImpl {
  /**
   * Get set of all deleted user identifiers (IDs, usernames, display names, and variants)
   */
  public getDeletedUserIdentifiers(): Set<string> {
    try {
      const data = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
      if (data) {
        const list: string[] = JSON.parse(data);
        return new Set(list.map((item) => item.toLowerCase().trim()));
      }
    } catch (e) {
      console.warn('Failed to parse deleted user identifiers:', e);
    }
    return new Set<string>();
  }

  /**
   * Permanently delete / remove a user from the entire application.
   * Completely purges them from conversations, contacts, calls, and local state.
   */
  public deleteUser(identifier: string, secondaryIdentifier?: string, displayName?: string) {
    if (!identifier) return;

    try {
      const currentSet = this.getDeletedUserIdentifiers();

      const addVariants = (val?: string) => {
        if (!val) return;
        const clean = val.toLowerCase().trim();
        if (!clean) return;
        currentSet.add(clean);
        currentSet.add(clean.replace(/^@/, ''));
        currentSet.add(`@${clean.replace(/^@/, '')}`);

        const withoutUserPrefix = clean.replace(/^user_/, '');
        currentSet.add(withoutUserPrefix);
        currentSet.add(`user_${withoutUserPrefix}`);

        // Also add space vs underscore variants
        const withSpaces = withoutUserPrefix.replace(/_/g, ' ');
        const withUnderscores = withoutUserPrefix.replace(/\s+/g, '_');
        currentSet.add(withSpaces);
        currentSet.add(withUnderscores);
      };

      addVariants(identifier);
      addVariants(secondaryIdentifier);
      addVariants(displayName);

      localStorage.setItem(
        DELETED_USERS_STORAGE_KEY,
        JSON.stringify(Array.from(currentSet))
      );

      // Clean up admin users list if present
      try {
        const adminUsersData = localStorage.getItem('zenia_admin_users_list');
        if (adminUsersData) {
          const list = JSON.parse(adminUsersData);
          const filtered = list.filter((u: any) => !this.isUserDeleted(u));
          localStorage.setItem('zenia_admin_users_list', JSON.stringify(filtered));
        }
      } catch (_) {}

      // Clean up any conversations in localStorage with this deleted user
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('zenia_user_conversations_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const convs = JSON.parse(raw);
              const filteredConvs = convs.filter((c: any) => {
                const hasDeleted = c.participants?.some((p: string) =>
                  this.isIdentifierDeleted(p)
                );
                return !hasDeleted;
              });
              localStorage.setItem(key, JSON.stringify(filteredConvs));
            }
          }
        }
      } catch (_) {}

      // Clean up call history associated with this user
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('zenia_call_history_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const calls = JSON.parse(raw);
              const filteredCalls = calls.filter((call: any) => {
                return (
                  !this.isIdentifierDeleted(call.remoteUserId) &&
                  !this.isIdentifierDeleted(call.remoteUserName)
                );
              });
              localStorage.setItem(key, JSON.stringify(filteredCalls));
            }
          }
        }
      } catch (_) {}

      // Notify entire app of user deletion immediately
      window.dispatchEvent(new CustomEvent(USERS_UPDATED_EVENT, { detail: identifier }));
      // Also notify call history listeners
      window.dispatchEvent(new CustomEvent('zenia_call_history_updated'));
    } catch (e) {
      console.warn('Failed to save deleted user:', e);
    }
  }

  /**
   * Check if a specific string identifier is deleted
   */
  public isIdentifierDeleted(ident?: string): boolean {
    if (!ident) return false;
    const clean = ident.toLowerCase().trim();
    if (!clean) return false;
    const deletedSet = this.getDeletedUserIdentifiers();
    if (deletedSet.size === 0) return false;

    if (deletedSet.has(clean)) return true;
    if (deletedSet.has(clean.replace(/^@/, ''))) return true;

    const noUser = clean.replace(/^user_/, '');
    if (deletedSet.has(noUser)) return true;
    if (deletedSet.has(`user_${noUser}`)) return true;
    if (deletedSet.has(noUser.replace(/_/g, ' '))) return true;
    if (deletedSet.has(noUser.replace(/\s+/g, '_'))) return true;

    return false;
  }

  /**
   * Check if a user object is deleted
   */
  public isUserDeleted(user?: { id?: string; username?: string; displayName?: string; email?: string } | null): boolean {
    if (!user) return false;
    const deletedSet = this.getDeletedUserIdentifiers();
    if (deletedSet.size === 0) return false;

    if (user.id && this.isIdentifierDeleted(user.id)) return true;
    if (user.username && this.isIdentifierDeleted(user.username)) return true;
    if (user.displayName && this.isIdentifierDeleted(user.displayName)) return true;
    if (user.email && deletedSet.has(user.email.toLowerCase().trim())) return true;

    return false;
  }

  /**
   * Filter active contacts list removing all deleted users
   */
  public filterActiveContacts<T extends { id?: string; username?: string; displayName?: string; email?: string }>(
    contacts: T[]
  ): T[] {
    const deletedSet = this.getDeletedUserIdentifiers();
    if (deletedSet.size === 0) return contacts;

    return contacts.filter((c) => !this.isUserDeleted(c));
  }

  /**
   * Subscribe to deletion events
   */
  public subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(USERS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(USERS_UPDATED_EVENT, handler);
  }
}

export const userService = new UserServiceImpl();
