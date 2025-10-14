import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const isAdmin = await authService.isAdmin();
    
    if (isAdmin) {
      return true;
    } else {
      console.log('Acceso denegado: el usuario no es administrador');
      router.navigate(['/acceso-denegado']);
      return false;
    }
  } catch (error) {
    console.error('Error en adminGuard:', error);
    router.navigate(['/acceso-denegado']);
    return false;
  }
};
