import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
// import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorService implements HttpInterceptor {
  private readonly requests: HttpRequest<any>[] = [];

  constructor(private readonly storage: StorageService, private readonly toaster: ToastController) { }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.storage.getItem('USER'))
      .pipe(
        switchMap(user => {
          const token = user?.token;
          if (token) {
            request = request.clone({
              headers: request.headers.set('x-token', `${token}`),
            });
          }
          request = request.clone({
            headers: request.headers
              .set('Cache-Control', 'no-cache')
              .set('Pragma', 'no-cache'),
          });
          request = request.clone({ headers: request.headers.set('Accept', '*/*') });
          this.requests.push(request);
          return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
              if (event instanceof HttpResponse) {
                // if(event.status === HttpStatusCode.Ok){
                //   this.showPrompt('success', `Response Status: ${event.status}`, "Request successfully carried out");
                // };
                this.removeRequest(request);
              }
              return event;
            }),
            catchError((error: HttpErrorResponse) => {
              const message = this.manageError(error);
              if (message) {
                //console.log('ERROR', message);
              }
              this.removeRequest(request);
              return throwError(error);
            })
          );
        })
      );
  }

  private readonly manageError = (error: HttpErrorResponse): string => {
    let message = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      message = `Error: ${error.error.message}`;
    } else if (error instanceof HttpErrorResponse) {
      if (error.status > -1) {
        message = this.checkErrorStatus(error);
      } else {
        if (error.statusText && !error.url.includes('changePassword')) {
          message = error.statusText;
        } else if (
          error.error &&
          error.error.errors &&
          error.error.errors.length > 0
        ) {
          const arrayMessage = error.error.errors;
          arrayMessage.forEach((element) => {
            message += `${element.msg}<br/>`;
          });
        }
      }
    }
    return message;
  };

  private checkErrorStatus(e) {
    let msg: string;
    //console.log('STATUS: ' + e.status);
    switch (e.status) {
      case 0:
        msg = 'Connection error';
        break;
      case 400:
        msg = 'Bad request';
        break;
      case 401:
        msg = 'Authentication error';
        window.location.href = '/';
        break;
      case 405:
        msg = 'Not allowed';
        break;
      case 409:
        this.manageInternalErrors(e);
        break;
      case 413:
        msg = 'Payload overflow';
        break;
      case 422:
        msg = 'Unprocessable entity';
        break;
      case 500:
        msg = 'Internal server errror';
        break;
      default:
        msg = 'Bad request';
        break;
    }
    this.presentErrorAlert(msg);
    return msg;
  }

  async presentErrorAlert(message) {
    const toast = await this.toaster.create({
      message,
      duration: 5000,
      position: 'top',
      color: 'danger',
    });

    await toast.present();
  }

  private manageInternalErrors(internalError) {
    //console.log(internalError);
  }
}
