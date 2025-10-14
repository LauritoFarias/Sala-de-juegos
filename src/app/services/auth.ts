import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  created_at: string;
  userId: string;
  nombre: string;
  edad: number;
  avatarUrl: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private isInitialized = false;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
    console.log('🔄 Auth service inicializado');
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🔄 Inicializando sistema de autenticación...');
    
    await this.checkCurrentUser();
    
    this.setupAuthListener();
    
    this.isInitialized = true;
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Evento de autenticación:', event, 'Usuario:', session?.user?.email);
      
      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ SIGNED_IN detectado, procesando...');
          setTimeout(async () => {
            await this.checkCurrentUser();
          }, 100);
          break;
          
        case 'SIGNED_OUT':
          console.log('🚪 SIGNED_OUT detectado');
          this.currentUser.next(null);
          break;
          
        case 'USER_UPDATED':
          console.log('👤 USER_UPDATED detectado');
          await this.checkCurrentUser();
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('🔄 TOKEN_REFRESHED detectado');
          break;
          
        default:
          console.log('⚡ Otro evento:', event);
      }
    });
  }

  async checkCurrentUser(): Promise<void> {
    try {
      console.log('🔍 Iniciando verificación de usuario...');
      
      console.log('🔍 Paso 1: Obteniendo sesión...');
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error al obtener sesión:', sessionError);
        this.currentUser.next(null);
        return;
      }

      if (!session?.user) {
        console.log('ℹ️ No hay sesión activa');
        this.currentUser.next(null);
        return;
      }

      console.log('✅ Sesión obtenida para:', session.user.email);
      console.log('🔍 User ID:', session.user.id);
      
      console.log('🔍 Paso 2: Buscando usuario en BD...');
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('userId', session.user.id)
        .single();

      if (userError) {
        console.error('❌ Error en consulta de usuario:', userError);
        await this.handleUserNotFound(session.user);
        return;
      }

      if (!user) {
        console.log('❌ Usuario no encontrado en public.users');
        await this.handleUserNotFound(session.user);
        return;
      }

      console.log('✅ Usuario encontrado en BD:', user.nombre);
      console.log('✅ Rol:', user.role);
      this.currentUser.next(user);
      
    } catch (error) {
      console.error('💥 Error crítico en checkCurrentUser:', error);
      this.currentUser.next(null);
    }
  }

  private async handleUserNotFound(authUser: any): Promise<void> {
    console.log('🆕 Usuario no encontrado en public.users, creando registro...');
    
    try {
      const newUser = {
        userId: authUser.id,
        nombre: authUser.email?.split('@')[0] || 'Usuario',
        edad: 25,
        avatarUrl: '',
        role: 'user'
      };

      const { data, error } = await this.supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) {
        console.error('❌ Error al crear usuario:', error);
        this.currentUser.next(null);
        return;
      }

      console.log('✅ Nuevo usuario creado:', data);
      this.currentUser.next(data);
      
    } catch (error) {
      console.error('💥 Error al manejar usuario no encontrado:', error);
      this.currentUser.next(null);
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      console.log('👑 Verificando permisos de administrador...');
      const user = this.currentUser.value;
      
      if (!user) {
        console.log('👑 No hay usuario, verificando sesión...');
        await this.checkCurrentUser();
        return this.currentUser.value?.role === 'admin';
      }
      
      const isAdmin = user.role === 'admin';
      console.log('👑 Resultado:', { 
        usuario: user.nombre, 
        rol: user.role, 
        esAdmin: isAdmin 
      });
      return isAdmin;
      
    } catch (error) {
      console.error('💥 Error en isAdmin:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  async forceCheck(): Promise<void> {
    console.log('⚡ Forzando verificación de usuario...');
    await this.checkCurrentUser();
  }

  async getAuthState(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    await this.checkCurrentUser();
    return {
      isAuthenticated: !!this.currentUser.value,
      user: this.currentUser.value
    };
  }

  async logout(): Promise<void> {
    console.log('🚪 Cerrando sesión...');
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
    this.currentUser.next(null);
  }
}