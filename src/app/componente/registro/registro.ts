import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  selector: 'app-registro',
  imports: [FormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {

  mail: string;
  password: string;
  name: string = '';
  age: number = 0;
  avatarFile: File | null = null;

  showPassword = false;

  constructor(private router: Router) {
    this.mail = '';
    this.password = '';
  }

  title = 'Sala de juegos';
  year = new Date().getFullYear();

  errorMessage = '';

  register() {
    console.log('Inciando registro en Supabase...')
    if (!this.avatarFile) {
      this.errorMessage = 'Por favor, seleccioná una imagen de perfil.';
      return;
    }
    supabase.auth.signUp({
      email: this.mail,
      password: this.password,
    }).then(({ data, error }) => {
      if (error) {
        console.error('Error:', error.message);
        
        if (error.message.includes('User already registered') || error.status === 400) {
          this.errorMessage = 'Este email ya está registrado. Por favor, usá otro.';
        }
        
      } else {

        console.log('User registered:', data.user);
        this.saveUserData(data.user!);
        
      }
    }
    );

  }

  async saveUserData(user: User) {
    console.log('🟢 Iniciando guardado de datos para:', user.id);

    try {
      // 1️⃣ Subir imagen si existe
      if (!this.avatarFile) {
        console.warn('⚠️ No se seleccionó ningún archivo de imagen.');
      } else {
        console.log('📤 Subiendo imagen a Supabase Storage...');
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('images')
          .upload(`users/${user.id}-${this.avatarFile.name}`, this.avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ Error subiendo imagen:', uploadError.message);
        } else {
          console.log('✅ Imagen subida correctamente:', uploadData.path);
        }

        // 2️⃣ Insertar usuario en tabla "users"
        console.log('🧩 Insertando usuario en tabla "users"...');
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            userId: user.id,
            nombre: this.name,
            edad: this.age,
            avatarUrl: uploadData?.path ?? null,
          })
          .select(); // para ver qué se insertó

        if (insertError) {
          console.error('❌ Error insertando usuario:', insertError.message);
        } else {
          console.log('✅ Usuario insertado:', insertData);
          this.goTo('/home');
        }
      }
    } catch (err) {
      console.error('💥 Error inesperado en saveUserData:', err);
    }
  }

  async saveFile() {
    console.log('Guardando imagen. File:', this.avatarFile);
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(`users/${this.avatarFile?.name}`, this.avatarFile!, {
        cacheControl: '3600',
        upsert: false
      });

    console.log(data);
    return data;
  }

  onFileSelected(event: any) {
    this.avatarFile = event.target.files[0];
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

}
