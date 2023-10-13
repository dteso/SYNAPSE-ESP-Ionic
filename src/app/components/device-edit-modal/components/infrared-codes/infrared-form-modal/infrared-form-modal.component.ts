import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-infrared-form-modal',
  templateUrl: './infrared-form-modal.component.html',
  styleUrls: ['./infrared-form-modal.component.scss'],
})
export class InfraredFormModalComponent implements OnInit {

  irDataForm: FormGroup;

  constructor(
    private readonly modalController: ModalController,
    private readonly formBuilder: FormBuilder
  ) {
    this.irDataForm = this.formBuilder.group({
      key: [null],
      tv: [null],
      model: [null],
    });
  }

  ngOnInit() { }

  async dismiss(value) {
    console.log('dismissValue', value);
    await this.modalController.dismiss({
      irDataForm: value,
    });
  }

  async startIrListening() {
    await this.dismiss(this.irDataForm);
  }

}
