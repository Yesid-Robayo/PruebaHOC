import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { LocalStorageAuthAdapter } from '../../infrastructure/adapters/local-storage-auth.adapter';

export const authGuard = () => {
  const authService = inject(LocalStorageAuthAdapter);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user) {
        return true;
      }
      return router.parseUrl('/login');
    })
  );
};