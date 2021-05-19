import { Component, Input, OnInit } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from 'src/app/usuarios/auth.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { Factura } from '../../facturas/models/factura';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {

  @Input() cliente: Cliente;
  titulo: string = 'Detalle del cliente';
  fotoSeleccionada: File;
  progreso: number = 0;
  modalServ = this.modalService;
  servicioCliente = this.authService;

  constructor(private clienteService : ClienteService,
              private facturaService: FacturaService,
              public authService: AuthService, 
              public modalService: ModalService) { }

  ngOnInit(): void {
    
  }

  seleccionarFoto(event) {
      this.fotoSeleccionada = event.target.files[0];
      this.progreso = 0;
      console.log(this.fotoSeleccionada);
      if(this.fotoSeleccionada.type.indexOf('image') < 0){
        swal('Error al seleccionar imagen: ', 'El archivo debe ser de tipo imagen!', 'error');
        this.fotoSeleccionada = null;
      }
  }

  subirFoto() {

    if(!this.fotoSeleccionada) {
        swal('Error Upload: ', 'Debe seleccionar una foto!', 'error');
    } else {

    
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id)
            .subscribe(event => {

              // Si el evento es de tipo UploadProgress (no se ha terminado de subir el archivo) calcula el porcentaje subido.
              if(event.type === HttpEventType.UploadProgress){
                this.progreso = Math.round((event.loaded/event.total)*100);
              // Si el evento es de tipo Response (se termino de subir el archivo), convierte el event body en tipo any y la asigna a response
              } else if(event.type === HttpEventType.Response) {
                let response: any = event.body;
                // this.cliente = cliente; para asignar la response a la variable cliente usando un alias para convertirla en tipo Cliente
                this.cliente = response.cliente as Cliente;

                this.modalService.notificarUpload.emit(this.cliente);
                swal('Foto subida correctamente!', response.mensaje, 'success');
              }
              
              
            });
    }
  }

  cerrarModal() {
    this.modalService.cerrarModal();
    this.fotoSeleccionada = null;
    this.progreso = 0;
  }

  delete(factura: Factura): void {
    swal({
      title: '¿Está seguro?',
      text: `¿Seguro que desea eliminar la factura ${factura.descripcion}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      
      if (result.value) {

        this.facturaService.delete(factura.id).subscribe(
          () => {
            this.cliente.facturas = this.cliente.facturas.filter(fact => fact !== factura);
            swal(
              'Factura Eliminada!',
              `Factura ${factura.descripcion} eliminada con éxito.`,
              'success'
            )
          }
        )

      }


    });
    
  }
}
