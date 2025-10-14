import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from '../../componente/home/home';
import { QuienSoy } from '../../componente/quien-soy/quien-soy';
import { Registro } from '../../componente/registro/registro';
import { Resultados } from '../../componente/resultados/resultados';
import { Encuesta } from '../../componente/encuesta/encuesta';
import { RespuestasEncuesta } from '../../componente/respuestas-encuesta/respuestas-encuesta';
import { adminGuard } from '../../guards/admin-guard';

const routes: Routes = [
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
      path: 'resultados',
      component: Resultados
  },
  {
      path: 'encuesta',
      component: Encuesta
  },
  {
    path: 'admin/encuestas',
    component: RespuestasEncuesta,
    canActivate: [adminGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContenidoRoutingModule { }
