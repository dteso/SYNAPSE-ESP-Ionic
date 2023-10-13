import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { CustomModalComponent } from '../custom-modal/custom-modal.component';

@Component({
  selector: 'app-client-modal',
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.scss'],
})
export class ClientModalComponent implements OnInit {

  clientForm: FormGroup;
  client: any; // El que llegará en el caso de que sea edición
  clientId: number;

  isAdding: boolean;
  isEditing: boolean;

  modal;

  constructor(
    private readonly modalController: ModalController,
    private readonly formBuilder: FormBuilder,
    private readonly clientsService: ClientsService,
    private readonly toastController: ToastController,
  ) {
    this.clientForm = this.formBuilder.group({
      name: [{ value: '', disabled: false }, Validators.required],
      province: [''],
      location: [''],
      street: [''],
      contactName: [''],
      telephone: [''],
      email: [''],
    });
  }

  ngOnInit() {
    console.log(this.client);

    if (this.client !== null && this.client !== undefined) {
      this.isAdding = false;
      this.isEditing = true;
    } else {
      this.isAdding = true;
      this.isEditing = false;
    }

    this.clientId = this.client.uid;

    delete this.client.user;
    delete this.client.uid;

    this.clientForm.setValue(this.client);

    this.client.uid = this.clientId;
  }

  async dismiss(entity) {
    await this.modalController.dismiss({
      'dismissed': true,
      'closePayload': entity
    });
  }

  save() {
    if (this.clientForm.valid) {
      console.log(this.clientForm.value);

      if (this.isAdding) {
        this.clientsService.createByLoggedUser(this.clientForm.value).subscribe(res => {
          console.log('Usuario registrado', res);
          this.presentSuccessAlert('¡Cliente creado correctamente!', 'El cliente se ha añadido a la lista.');
          this.dismiss(res.dbCustomer);
        });
      }

      if (this.isEditing) {
        this.clientsService.updateClientById(this.clientId, this.clientForm.value).subscribe(res => {
          console.log('Usuario actualizado', res);
          this.presentSuccessAlert('¡Cliente actualizado correctamente!', 'Se han modificado correctamente los datos del cliente');
          this.dismiss(this.clientForm.value);
        });
      }

    }
  }

  async presentSuccessAlert(title, message) {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'alert-success-class',
      componentProps: {
        title,
        message,
        icon: {
          url: "../../../assets/icons/dark-success.apng"
        },
        buttons: [
          {
            caption: 'Ok',
            value: 'Y',
            color: '#223240',
            background: '#76E596'
          }
        ]
      }
    });
    return await this.modal.present();
  }
}
