import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Region } from './region';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

    titulo: string = 'Crear Cliente';
    public cliente: Cliente = new Cliente();
    regiones: Region[];
    errores: string[];

    constructor(private clienteService: ClienteService, 
                private router: Router,
                private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.cargarCliente();
    }

    cargarCliente(): void {
        this.activatedRoute.params.subscribe(params => {
          let id = params['id'];
          if(id){
            this.clienteService.getCliente(id)
                               .subscribe((cliente) => this.cliente = cliente)
          }
        });

        this.clienteService.getRegiones().subscribe(regiones => {
          this.regiones = regiones;
        });
    }

    create(): void {
       console.log(this.cliente);
       this.clienteService.create(this.cliente)
                         .subscribe(cliente => {
                              this.router.navigate(['/clientes'])
                              swal('Nuevo cliente', `El cliente: ${cliente.nombre} ${cliente.apellido} ha sido creado con éxito!`, 'success')
                            },
                            err => {
                              this.errores = err.error.errors as string[];
                              console.error('Código del error desde el backend: ' + err.status);
                              console.error(err.error.errors);
                            }
                         ); 
   }   
   
   update():void{
     console.log(this.cliente);

     this.cliente.facturas = null;
     this.clienteService.update(this.cliente)
                        .subscribe( json => {
                          this.router.navigate(['/clientes'])
                          swal('Cliente Actualizado!', `${json.mensaje}: ${json.cliente.nombre} ${json.cliente.apellido}`, 'success')

                        },
                        err => {
                          this.errores = err.error.errors as string[];
                          console.error('Código del error desde el backend: ' + err.status);
                          console.error(err.error.errors);
                        }
                        )
                            
   }

   compararRegion(o1: Region, o2: Region): boolean {
    if(o1 === undefined && o2 === undefined){
      return true;
    }    
    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false: o1.id === o2.id;
   }
}
