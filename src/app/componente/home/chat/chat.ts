import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat implements OnInit, OnDestroy {

  @Input() usuario: string | undefined = '';
  @Input() cerrarChat!: () => void;

  mensajes: { autor: string; texto: string; hora: string }[] = [];
  nuevoMensaje = '';
  supabase: SupabaseClient;

  escribiendoUsuarios = new Map<string, any>();
  typingTimeout: any;
  canal: any;

  nuevosMensajesCount = 0;
  mostrarBotonNuevosMensajes = false;
  estaEnFondo = true;

  constructor(private cdr: ChangeDetectorRef) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      this.mensajes = data.map((msg: any) => ({
        autor: msg.autor,
        texto: msg.texto,
        hora: new Date(msg.created_at).toLocaleString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })
      }));
      this.scrollToBottom();
      this.cdr.detectChanges();
    }

    this.canal = this.supabase.channel('chat-room');

    this.canal.on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      },
      (payload: any) => {
        console.log('Nuevo mensaje recibido via realtime:', payload);
        this.agregarMensajeDesdePayload(payload);
      }
    );

    this.canal.on(
      'broadcast',
      { event: 'typing' },
      (payload: any) => {
        this.manejarTyping(payload);
      }
    );

    // Suscribirse
    this.canal.subscribe((status: any) => {
      if (status === 'SUBSCRIBED') {
        console.log('Canal suscrito correctamente');
      } else {
        console.log('Estado del canal:', status);
      }
    });
  }

  private agregarMensajeDesdePayload(payload: any) {
    if (!payload.new || !payload.new.autor || !payload.new.texto) {
      console.error('Payload inválido:', payload);
      return;
    }

    const msg = payload.new;
    const mensajeYaExiste = this.mensajes.some(existingMsg => 
      existingMsg.autor === msg.autor && 
      existingMsg.texto === msg.texto &&
      existingMsg.hora === new Date(msg.created_at).toLocaleString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      })
    );

    if (!mensajeYaExiste) {
      this.mensajes.push({
        autor: msg.autor,
        texto: msg.texto,
        hora: new Date(msg.created_at).toLocaleString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })
      });

      // Verificar si está en el fondo para mostrar notificación
      if (!this.estaEnFondo) {
        this.nuevosMensajesCount++;
        this.mostrarBotonNuevosMensajes = true;
      } else {
        this.scrollToBottom();
      }
      this.cdr.detectChanges();
    }
  }

  private manejarTyping(payload: any) {
    const autor = payload?.payload?.autor;
    if (!autor || autor === this.usuario) return;

    if (this.escribiendoUsuarios.has(autor)) {
      clearTimeout(this.escribiendoUsuarios.get(autor));
    }

    const timeoutId = setTimeout(() => {
      this.escribiendoUsuarios.delete(autor);
      this.cdr.detectChanges();
    }, 3000);

    this.escribiendoUsuarios.set(autor, timeoutId);

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.canal) {
      this.supabase.removeChannel(this.canal);
    }
  }

  async enviarMensaje() {
    const texto = this.nuevoMensaje.trim();
    if (texto === '' || !this.usuario) {
      return;
    }

    try {
      console.log('Enviando mensaje...');
      
      const { error } = await this.supabase
        .from('chat_messages')
        .insert([
          { 
            autor: this.usuario, 
            texto: texto 
          }
        ]);

      if (error) {
        console.error('Error al enviar mensaje:', error);
      } else {
        console.log('Mensaje enviado exitosamente a Supabase');
        this.nuevoMensaje = '';
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  }

  usuarioEscribiendo() {
    clearTimeout(this.typingTimeout);
    
    this.canal.send({
      type: 'broadcast',
      event: 'typing',
      payload: { autor: this.usuario }
    });

    this.typingTimeout = setTimeout(() => {
    }, 2000);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
        this.estaEnFondo = true;
      }
    }, 100);
  }

  onChatScroll(event: any) {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    
    this.estaEnFondo = atBottom;
    
    if (atBottom) {
      this.nuevosMensajesCount = 0;
      this.mostrarBotonNuevosMensajes = false;
    }
    this.cdr.detectChanges();
  }

  irAlUltimoMensaje() {
    this.scrollToBottom();
    this.nuevosMensajesCount = 0;
    this.mostrarBotonNuevosMensajes = false;
    this.estaEnFondo = true;
  }
  
}