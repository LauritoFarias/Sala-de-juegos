import { Routes } from '@angular/router';
import { Home } from './componente/home/home';
import { Login } from './componente/login/login';
import { QuienSoy } from './componente/quien-soy/quien-soy';
import { Registro } from './componente/registro/registro';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'contenido',
        loadChildren: () => import('./modules/contenido/contenido-module').then(m => m.ContenidoModule),
    },
    {
        path: 'juegos',
        loadChildren: () => import('./modules/juegos/juegos-module').then(m => m.JuegosModule),
    },
    {
        path: '**',
        redirectTo: ''
    }
];
