import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Ahorcado } from '../../componente/juegos/ahorcado/ahorcado';
import { MayorOMenor } from '../../componente/juegos/mayor-o-menor/mayor-o-menor';
import { Preguntados } from '../../componente/juegos/preguntados/preguntados';
import { Simon } from '../../componente/juegos/simon/simon';

const routes: Routes = [
  {
    path: 'ahorcado',
    component: Ahorcado,
  },
  {
    path: 'mayor-o-menor',
    component: MayorOMenor,
  },
  {
    path: 'preguntados',
    component: Preguntados,
  },
  {
    path: 'simon',
    component: Simon,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JuegosRoutingModule { }
