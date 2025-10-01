import { Routes } from '@angular/router';
import { Home } from './componente/home/home';
import { Login } from './componente/login/login';
import { QuienSoy } from './componente/quien-soy/quien-soy';
import { Registro } from './componente/registro/registro';

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'quien-soy',
        component: QuienSoy
    },
    {
        path: 'registro',
        component: Registro
    },
    {
        path: '**',
        redirectTo: ''
    }
];
