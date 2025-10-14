import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-encuesta',
  imports: [CommonModule, FormsModule],
  templateUrl: './encuesta.html',
  styleUrl: './encuesta.scss'
})
export class Encuesta {
   @ViewChild('encuestaForm') encuestaForm!: NgForm;

  preguntas = {
    calificacion: ['Excelente', 'Buena', 'Regular', 'Mala'],
    servicios: ['Bar', 'Torneos', 'Área VIP', 'Estacionamiento'],
    frecuencia: ['Diariamente', 'Semanalmente', 'Mensualmente', 'Primera vez']
  }

  serviciosSeleccionados: { [key: string]: boolean } = {
    'Bar': false,
    'Torneos': false,
    'Área VIP': false,
    'Estacionamiento': false
  };

  enviando = false;
  enviadoExitosamente = false;
  errorEnvio = false;

  constructor(private supabaseService: SupabaseService) {}

  async onSubmit() {
    if (this.encuestaForm.invalid) {
      this.marcarCamposComoTouched();
      return;
    }

    if (!this.alMenosUnServicioSeleccionado()) {
      return;
    }

    this.enviando = true;
    this.errorEnvio = false;

    try {
      const encuestaData = {
        nombre_apellido: this.encuestaForm.value.nombre,
        edad: this.encuestaForm.value.edad,
        telefono: this.encuestaForm.value.telefono,
        calificacion_juegos: this.encuestaForm.value.calificacion,
        servicios_adicionales: this.obtenerServiciosSeleccionados(),
        frecuencia_visita: this.encuestaForm.value.frecuencia,
        juego_favorito: this.encuestaForm.value.juegoFavorito,
        email_referido: this.encuestaForm.value.referido
      };

      console.log('Datos a enviar:', encuestaData);

      const resultado = await this.supabaseService.guardarEncuesta(encuestaData);

      if (resultado.error) {
        throw resultado.error;
      }

      this.enviadoExitosamente = true;
      this.encuestaForm.resetForm();
      this.limpiarServiciosSeleccionados();
      
    } catch (error) {
      console.error('Error al enviar encuesta:', error);
      this.errorEnvio = true;
    } finally {
      this.enviando = false;
    }
  }

  private obtenerServiciosSeleccionados(): string[] {
    return Object.keys(this.serviciosSeleccionados).filter(
      servicio => this.serviciosSeleccionados[servicio]
    );
  }

  public alMenosUnServicioSeleccionado(): boolean {
    const servicios = this.obtenerServiciosSeleccionados();
    return servicios.length > 0;
  }

  private limpiarServiciosSeleccionados(): void {
    Object.keys(this.serviciosSeleccionados).forEach(key => {
      this.serviciosSeleccionados[key] = false;
    });
  }

  private marcarCamposComoTouched() {
    Object.keys(this.encuestaForm.controls).forEach(key => {
      this.encuestaForm.controls[key].markAsTouched();
    });
  }
}
