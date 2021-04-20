import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  currentPage:any = 0;
  ingredientsTemp:any = [{num:0, value:""}];  
  modal:any = {open:false, cntx:"", obj:{}};
  textToSearch:string ='';
  addRecipe:any = { images:[{}, {}, {}, {}, {}], images_filled:['','', '', '', ''] };
  constructor(public dataServ:DatabaseService) { }

  ngOnInit(): void {
  }

  clickPage (page) {
    this.currentPage = page;
  }

  trackByNum(index: number, ingridient: any) {
    return ingridient.num;
} 


  changedField(ingridient, i) {
    if (ingridient.value.length > 0) {
      let counter = i + 1 ;
      if (counter == this.ingredientsTemp.length) {
        this.ingredientsTemp.push({ num:i + 1, value:"" });
      } 
    }
  }

  RemoveIngredient(i) {
    this.ingredientsTemp.splice(i, 1);
  }
  
  AddNewRecipe(){ 
    let ingredients = [];
    for (let i=0; i < this.ingredientsTemp.length; i++) {
      ingredients.push(this.ingredientsTemp[i]['value']);
    } 
    let ingredientsStr = JSON.stringify(ingredients);
    this.ingredientsTemp = [{num:0, value:""}];
    this.dataServ.CreateNewRecipe(this.addRecipe, this.modal.obj.title, this.modal.obj.description, ingredientsStr, this.modal.obj.difficulty, this.modal.obj.preparation, this.modal.obj.portion, this);
  }

  EditRecipe() { 
    let ingredients = [];
    for (let i=0; i < this.ingredientsTemp.length; i++) {
      if (this.ingredientsTemp[i]['value'])
      ingredients.push(this.ingredientsTemp[i]['value']);
    } 
    let ingredientsStr = JSON.stringify(ingredients);
    this.ingredientsTemp = [{num:0, value:""}];
    this.dataServ.EditRecipeById(this.addRecipe, this.modal.obj.uid, this.modal.obj.title, this.modal.obj.description, ingredientsStr, this.modal.obj.difficulty, this.modal.obj.preparation, this.modal.obj.portion, this);
  }

  OpenModal(cntx, obj){ 
    this.ingredientsTemp = [{num:0, value:""}];
    this.modal = { open:true, 'cntx':cntx, 'obj':obj };
    console.log(this.modal.obj);
    if (cntx == 'add-recipe') {
      this.addRecipe = { images:[{}, {}, {}, {}, {}], images_filled:['','', '', '', ''] };
    } else if (cntx == 'edit-recipe') {
      this.addRecipe = { images:[{}, {}, {}, {}, {}], images_filled:['','', '', '', ''] };
      let ingredientsArr = JSON.parse(this.modal.obj.ingredients);    
      this.ingredientsTemp = []; 
      let ingredientsArrLength = ingredientsArr.length;
      for (let i=0; i<ingredientsArrLength; i++) {        
        this.ingredientsTemp.push({ num:i , value:ingredientsArr[i] });      
      }
      this.ingredientsTemp.push({ num:ingredientsArrLength , value: "" }); 
      let uid = this.modal.obj.uid;     
      for (let k=1; k<=5; k++) {
        this.addRecipe['images'][k-1] = 'assets/images/recipe-' + uid + '-image' + k + '.jpeg' ;       
      }
    } 
  
  }

  CloseModal() {
    this.modal.open = false;
  }

  openFileManagement(event: any, id){
    event.preventDefault();
    var fileManager = document.getElementById("picture-upload" + id);
    fileManager.click();
  }

  onFileChange(event: any, id) { 
    let files = event.target.files;   
    this.addRecipe.images_filled[parseInt(id)] = files[0].name;   
    this.getBase64(files[0]).then(
      data => {this.addRecipe.images[parseInt(id)] = data;   console.log(this.addRecipe);}
    );   
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);     
    });
  }

}
