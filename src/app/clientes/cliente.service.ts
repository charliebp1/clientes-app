import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Router } from '@angular/router'; 

import { URL_BACKEND } from '../config/config';



@Injectable({
  providedIn: 'root'
})

export class ClienteService {
  
  private urlEndPoint: string = URL_BACKEND + '/api/clientes';
  // private httpHeaders = new HttpHeaders({'content-Type' : 'application/json'});

  constructor(private http: HttpClient, private router: Router) { 

  }

  /*private agregarAuthorizationHeader() {
    let token = this.authService.token;
    if(token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }*/

  

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  getClientes(page: number): Observable<any> {
    // return of(CLIENTES);
    // return this.http.get<Cliente[]>(this.urlEndPoint);
    // retorna la colección de clientes
    return this.http.get(this.urlEndPoint + '/page/' + page)
                    .pipe(
                      tap((response: any) => {
                        
                        console.log('ClienteService: tap 1');
                        (response.content as Cliente[]).forEach( cliente => {
                          console.log(cliente.nombre);
                        }

                        )
                      }),
                      map((response: any) => {
                        
                        (response.content as Cliente[]).map(cliente => {
                          cliente.nombre = cliente.nombre.toUpperCase();

                          // registrar la localización: registerLocaleData(localeEs, 'es');
                          // definir localización: let datePipe = new DatePipe('es-ES');
                        
                          // Con formatDate: cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
                          // Con datePipe: cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
                          return cliente;
                      });
                      return response;
                    }
                    ),
                    tap(response => {
                      console.log('ClienteService: tap 2');
                        (response.content as Cliente[]).forEach( cliente => {
                        console.log(cliente.nombre);
                      }
                    )
                    })
    );
  }

  // Creado con pipe(map => response as respuesta) para tipo de datos personalizados
  create(cliente: Cliente) : Observable<Cliente> {
     return this.http.post(this.urlEndPoint, cliente).pipe(
       map((response: any) => response.cliente as Cliente),
       catchError(e => {

         if(e.status == 400) {
          return throwError(e);
         }
         if(e.error.mensaje) {
          console.error(e.error.mensaje);
         }
         
         return throwError(e);
       })
     )
  }

  getCliente(id): Observable<Cliente> {
      return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
        catchError(e => {
          if(e.status != 401 && e.error.mensaje) {
            this.router.navigate(['/clientes']);
            console.error(e.error.mensaje);  
          }
          return throwError(e);
        })
      );
  }

  // Creado con tipo de datos <any> para obtener una respuesta de tipo Object genérica
  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      catchError(e => {

        if(e.status == 400) {
          return throwError(e);
        }

        if(e.error.mensaje) {
          console.error(e.error.mensaje);
        }

        return throwError(e);
      })
    )
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {

        if(e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable <HttpEvent<{}>>{

    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

   
    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });
    
    return this.http.request(req);

  }

}
