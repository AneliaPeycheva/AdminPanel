import { Component } from '@angular/core';
import { DatabaseService } from './/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AdminPanel';
  username:string = "";
  password:string = "";
  constructor (public dataServ:DatabaseService){ }

  Login() {
    this.dataServ.Login(this.username, this.password, this);
  }

  
}
